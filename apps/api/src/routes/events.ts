import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { and, eq, sql, count } from 'drizzle-orm'
import { db } from '../db'
import { activityEvents, sessions, mauUsers, usageCounters } from '../db/schema'
import { validateApiKey } from '../lib/auth'
import { detectStuck } from '../services/idle'
import { rateLimit } from '../lib/redis'
import { getLimits, withinLimit } from '../lib/plan-limits'
import { billingWindowKey } from '../lib/utils'

const EventSchema = z.object({
  event_type:   z.enum(['page_view', 'idle', 'activation', 'custom']),
  page_path:    z.string().optional(),
  idle_seconds: z.number().optional(),
  metadata:     z.record(z.unknown()).optional()
})


export async function eventRoutes(app: FastifyInstance) {

  // POST /v1/sessions/:id/events
  app.post('/sessions/:id/events', async (req, reply) => {
    const org = await validateApiKey(req)
    if (!org) return reply.code(401).send({ error: 'Invalid API key' })

    const { id } = req.params as { id: string }
    const body = EventSchema.parse(req.body)

    // Rate limit: 60 events per session per minute
    const allowed = await rateLimit(`evt:${id}`, 60, 60)
    if (!allowed) return reply.code(429).send({ error: 'Rate limit exceeded', retry_after: 60 })

    // Fetch session to get end_user_id for MAU tracking
    const session = await db.query.sessions.findFirst({
      where: (s, { and }) => and(eq(s.id, id), eq(s.org_id, org.id))
    })
    if (!session) return reply.code(404).send({ error: 'Session not found' })

    await db.insert(activityEvents).values({
      session_id: id,
      org_id:     org.id,
      event_type: body.event_type,
      page_path:  body.page_path,
      metadata:   body.metadata ?? {}
    })

    // Handle activation event
    if (body.event_type === 'activation') {
      await db.update(sessions)
        .set({ status: 'completed', activated_at: new Date() })
        .where(eq(sessions.id, id))
    }

    // ─── MAU enforcement on page_view ─────────────────────────────────────
    if (body.event_type === 'page_view') {
      const month  = billingWindowKey(org.plan_expires_at, org.plan)
      const limits = getLimits(org.plan)

      // Upsert mau_users — one row per (org, end_user, month)
      const inserted = await db
        .insert(mauUsers)
        .values({ org_id: org.id, end_user_id: session.end_user_id, month })
        .onConflictDoNothing()
        .returning({ id: mauUsers.id })

      // Only recount + enforce when a new unique user was just recorded
      if (inserted.length > 0) {
        const [{ mau }] = await db
          .select({ mau: count() })
          .from(mauUsers)
          .where(and(eq(mauUsers.org_id, org.id), eq(mauUsers.month, month)))

        const mauCount = Number(mau)

        // Update the cached mau_count in usage_counters
        await db
          .insert(usageCounters)
          .values({ org_id: org.id, month, trigger_count: 0, mau_count: mauCount })
          .onConflictDoUpdate({
            target: [usageCounters.org_id, usageCounters.month],
            set: { mau_count: mauCount },
          })

        if (!withinLimit(mauCount, limits.mau)) {
          return reply.code(402).send({
            error: 'Monthly active user limit reached',
            upgrade_url: 'https://cognity.com.au/#pricing',
          })
        }
      }
    }
    // ──────────────────────────────────────────────────────────────────────

    // Check if user is stuck and return nudge
    let nudge: string | null = null
    if (body.event_type === 'idle') {
      nudge = await detectStuck({
        sessionId:   id,
        pagePath:    body.page_path,
        idleSeconds: body.idle_seconds ?? 0,
        goalText:    session?.goal_text ?? undefined
      })
    }

    return reply.send({ received: true, ...(nudge && { nudge }) })
  })
}
