import { FastifyInstance } from 'fastify'
import { desc, eq, and, isNotNull, sql } from 'drizzle-orm'
import { db } from '../db'
import { sessions, activityEvents } from '../db/schema'
import { validateClerkJWT } from '../lib/auth'

export async function analyticsRoutes(app: FastifyInstance) {

  // GET /v1/analytics/overview
  app.get('/analytics/overview', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const [totalResult] = await db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(sessions)
      .where(eq(sessions.org_id, org.id))

    const [activatedResult] = await db
      .select({ activated: sql<number>`cast(count(*) as int)` })
      .from(sessions)
      .where(and(eq(sessions.org_id, org.id), isNotNull(sessions.activated_at)))

    const total     = totalResult?.total     ?? 0
    const activated = activatedResult?.activated ?? 0

    // Top stuck pages — pages with most idle events
    const stuckPages = await db
      .select({
        page_path:  activityEvents.page_path,
        idle_count: sql<number>`cast(count(*) as int)`,
      })
      .from(activityEvents)
      .where(and(eq(activityEvents.org_id, org.id), eq(activityEvents.event_type, 'idle')))
      .groupBy(activityEvents.page_path)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(5)

    return reply.send({
      total_sessions:     total,
      activated_sessions: activated,
      activation_rate:    total > 0 ? Number((activated / total).toFixed(3)) : 0,
      top_stuck_pages:    stuckPages,
    })
  })
}
