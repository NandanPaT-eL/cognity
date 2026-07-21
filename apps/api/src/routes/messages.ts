import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { and, eq, sql, asc } from 'drizzle-orm'
import { db } from '../db'
import { messages, sessions, usageCounters, tours, tourSteps } from '../db/schema'
import { validateApiKey } from '../lib/auth'
import { generateAIResponse } from '../services/ai'
import { rateLimit } from '../lib/redis'
import { getLimits, withinLimit } from '../lib/plan-limits'
import { currentMonth, billingWindowKey } from '../lib/utils'
import { clerkClient } from '@clerk/fastify'
import { sendLimitWarningEmail } from '../lib/email'

const MessageSchema = z.object({
  content:          z.string().min(1).max(2000),
  skip_tour_match:  z.boolean().optional(),  // set by SDK when user chose "Answer instead"
})

export async function messageRoutes(app: FastifyInstance) {

  // POST /v1/sessions/:id/messages — streaming response
  app.post('/sessions/:id/messages', async (req, reply) => {
    const org = await validateApiKey(req)
    if (!org) return reply.code(401).send({ error: 'Invalid API key' })

    const { id } = req.params as { id: string }
    const body = MessageSchema.parse(req.body)

    // Rate limit: 30 messages per session per minute
    const allowed = await rateLimit(`msg:${id}`, 30, 60)
    if (!allowed) return reply.code(429).send({ error: 'Rate limit exceeded', retry_after: 60 })

    const session = await db.query.sessions.findFirst({
      where: (s, { and }) => and(eq(s.id, id), eq(s.org_id, org.id))
    })
    if (!session) return reply.code(404).send({ error: 'Session not found' })

    // ─── Tier enforcement: monthly trigger limit ───────────────────────────
    const month  = billingWindowKey(org.plan_expires_at, org.plan)
    const limits = getLimits(org.plan)

    // Upsert the usage_counters row so we always have a current row to read.
    await db
      .insert(usageCounters)
      .values({ org_id: org.id, month, trigger_count: 0, mau_count: 0 })
      .onConflictDoNothing()

    const [counter] = await db
      .select({ trigger_count: usageCounters.trigger_count })
      .from(usageCounters)
      .where(and(eq(usageCounters.org_id, org.id), eq(usageCounters.month, month)))
      .limit(1)

    if (!withinLimit(counter?.trigger_count ?? 0, limits.monthly_triggers)) {
      return reply.code(402).send({
        error: 'Monthly trigger limit reached',
        upgrade_url: 'https://cognity.com.au/#pricing',
      })
    }
    // ──────────────────────────────────────────────────────────────────────

    // Store user message
    await db.insert(messages).values({
      session_id: id,
      role: 'user',
      content: body.content
    })

    // Update goal_text on first message
    if (!session.goal_text) {
      await db.update(sessions)
        .set({ goal_text: body.content })
        .where(eq(sessions.id, id))
    }

    // Atomically increment trigger_count *before* streaming so that even a
    // dropped connection counts against the quota.
    // Note: sql`` is retained only for the SET expression (Drizzle has no built-in +1 helper).
    // The WHERE now uses proper eq/and predicates per spec.
    await db
      .update(usageCounters)
      .set({ trigger_count: sql`${usageCounters.trigger_count} + 1` })
      .where(and(eq(usageCounters.org_id, org.id), eq(usageCounters.month, month)))

    // ── 80% limit warning email ────────────────────────────────────────────
    // Re-read the updated count to check warning threshold.
    // Only fires at the message that crosses into the 80–85% window (avoids spam).
    const triggerLimit = limits.monthly_triggers
    if (triggerLimit > 0) {
      const [updated] = await db
        .select({ trigger_count: usageCounters.trigger_count })
        .from(usageCounters)
        .where(and(eq(usageCounters.org_id, org.id), eq(usageCounters.month, month)))
        .limit(1)

      const updatedCount = updated?.trigger_count ?? 0
      const pct = (updatedCount / triggerLimit) * 100

      if (pct >= 80 && pct < 85) {
        try {
          const clerkUser = await clerkClient.users.getUser(org.clerk_user_id ?? '')
          const email     = clerkUser.emailAddresses[0]?.emailAddress
          if (email) {
            sendLimitWarningEmail(email, org.name, pct).catch(() => {})
          }
        } catch {}
      }
    }
    // ──────────────────────────────────────────────────────────────────────

    // Stream AI response via SSE
    reply.hijack()
    const origin = req.headers.origin
    if (origin) {
      reply.raw.setHeader('Access-Control-Allow-Origin', origin)
      reply.raw.setHeader('Vary', 'Origin')
    }
    reply.raw.setHeader('Access-Control-Allow-Credentials', 'true')
    reply.raw.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
    reply.raw.setHeader('Access-Control-Expose-Headers', 'Content-Type')
    reply.raw.setHeader('Content-Type', 'text/event-stream')
    reply.raw.setHeader('Cache-Control', 'no-cache')
    reply.raw.setHeader('Connection', 'keep-alive')

    // ── AI-triggered tour matching ──────────────────────────────────────────
    // Skipped if the user already declined a tour offer for this message.
    if (!body.skip_tour_match) {
    const publishedTours = await db.query.tours.findMany({
      where: (t, { and, eq }) => and(eq(t.org_id, org.id), eq(t.status, 'published')),
    })

    const userLower = body.content.toLowerCase()
    const matchedTour = publishedTours.find(tour => {
      const nameLower = tour.name.toLowerCase()
      const urlLower  = tour.page_url.toLowerCase().replace(/[/-]/g, ' ')
      const nameWords = nameLower.split(/\s+/).filter(w => w.length > 3)
      const urlWords  = urlLower.split(/\s+/).filter(w => w.length > 3)
      return [...nameWords, ...urlWords].some(word => userLower.includes(word))
    })

    if (matchedTour) {
      const steps = await db.query.tourSteps.findMany({
        where: (s, { eq }) => eq(s.tour_id, matchedTour.id),
        orderBy: (s, { asc }) => [asc(s.step_order)],
      })

      // Ask the user whether they want the tour or a text answer.
      // The SDK renders two buttons; if they pick "tour" it launches it,
      // if they pick "answer" it re-sends with skip_tour_match=true.
      const offerMessage = `I can walk you through "${matchedTour.name}" as a guided tour, or I can answer you directly. Which would you prefer?`

      for (const char of offerMessage) {
        reply.raw.write(`data: ${JSON.stringify({ type: 'chunk', text: char })}\n\n`)
      }
      reply.raw.write(`data: ${JSON.stringify({
        type:      'tour_offer',
        tour_name: matchedTour.name,
        tour:      { id: matchedTour.id, steps },
      })}\n\n`)
      reply.raw.write('data: [DONE]\n\n')
      reply.raw.end()

      await db.insert(messages).values([
        { session_id: session.id, role: 'assistant', content: offerMessage },
      ])
      return
    }
    } // end skip_tour_match guard
    // ───────────────────────────────────────────────────────────────────────

    try {
      const { stream, messageId } = await generateAIResponse({
        session,
        userMessage: body.content,
        orgId: org.id
      })

      for await (const chunk of stream) {
        reply.raw.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`)
      }

      reply.raw.write(`data: ${JSON.stringify({ type: 'done', message_id: messageId })}\n\n`)
    } catch (error) {
      req.log.error({ err: error }, 'message stream failed')
      reply.raw.write(`data: ${JSON.stringify({
        type: 'error',
        message: error instanceof Error ? error.message : 'AI request failed'
      })}\n\n`)
    } finally {
      reply.raw.end()
    }
  })
}
