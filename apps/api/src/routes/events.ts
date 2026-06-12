import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { activityEvents, sessions } from '../db/schema'
import { validateApiKey } from '../lib/auth'
import { detectStuck } from '../services/idle'
import { rateLimit } from '../lib/redis'

const EventSchema = z.object({
  event_type: z.enum(['page_view', 'idle', 'activation', 'custom']),
  page_path: z.string().optional(),
  idle_seconds: z.number().optional(),
  metadata: z.record(z.unknown()).optional()
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

    await db.insert(activityEvents).values({
      session_id: id,
      org_id: org.id,
      event_type: body.event_type,
      page_path: body.page_path,
      metadata: body.metadata ?? {}
    })

    // Handle activation event
    if (body.event_type === 'activation') {
      await db.update(sessions)
        .set({ status: 'completed', activated_at: new Date() })
        .where(eq(sessions.id, id))
    }

    // Check if user is stuck and return nudge
    let nudge: string | null = null
    if (body.event_type === 'idle') {
      const session = await db.query.sessions.findFirst({
        where: (s, { and }) => and(eq(s.id, id), eq(s.org_id, org.id))
      })
      nudge = await detectStuck({
        sessionId: id,
        pagePath: body.page_path,
        idleSeconds: body.idle_seconds ?? 0,
        goalText: session?.goal_text ?? undefined
      })
    }

    return reply.send({ received: true, ...(nudge && { nudge }) })
  })
}
