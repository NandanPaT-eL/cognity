import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../db'
import { sessions } from '../db/schema'
import { validateApiKey } from '../lib/auth'
import { rateLimit } from '../lib/redis'

const CreateSessionSchema = z.object({
  end_user_id: z.string().min(1),
  page_path: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
})

export async function sessionRoutes(app: FastifyInstance) {

  // POST /v1/sessions
  app.post('/sessions', async (req, reply) => {
    const org = await validateApiKey(req)
    if (!org) return reply.code(401).send({ error: 'Invalid API key' })

    // Rate limit: 10 new sessions per API key per minute
    const allowed = await rateLimit(`sess:${org.id}`, 10, 60)
    if (!allowed) return reply.code(429).send({ error: 'Rate limit exceeded', retry_after: 60 })

    const body = CreateSessionSchema.parse(req.body)

    const [session] = await db.insert(sessions).values({
      org_id: org.id,
      end_user_id: body.end_user_id,
      status: 'active'
    }).returning()

    return reply.code(201).send({
      session_id: session.id,
      opening_message: 'Welcome! What are you trying to achieve today?',
      status: 'active'
    })
  })

  // GET /v1/sessions/:id
  app.get('/sessions/:id', async (req, reply) => {
    const org = await validateApiKey(req)
    if (!org) return reply.code(401).send({ error: 'Invalid API key' })

    const { id } = req.params as { id: string }
    const { include_messages } = req.query as { include_messages?: string }

    const session = await db.query.sessions.findFirst({
      where: (s, { eq, and }) => and(eq(s.id, id), eq(s.org_id, org.id))
    })

    if (!session) return reply.code(404).send({ error: 'Session not found' })

    // Optionally include last 50 messages for chat history restore
    let history: { role: string; content: string }[] = []
    if (include_messages === 'true') {
      const rows = await db.query.messages.findMany({
        where: (m, { eq }) => eq(m.session_id, id),
        orderBy: (m, { asc }) => [asc(m.created_at)],
        limit: 50,
      })
      history = rows.map(r => ({ role: r.role, content: r.content }))
    }

    return reply.send({
      session_id:   session.id,
      status:       session.status,
      goal_text:    session.goal_text,
      activated_at: session.activated_at,
      messages:     history,
    })
  })
}
