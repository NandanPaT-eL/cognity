import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { messages, sessions } from '../db/schema'
import { validateApiKey } from '../lib/auth'
import { generateAIResponse } from '../services/ai'
import { rateLimit } from '../lib/redis'

const MessageSchema = z.object({
  content: z.string().min(1).max(2000)
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
      where: (s, { eq, and }) => and(eq(s.id, id), eq(s.org_id, org.id))
    })
    if (!session) return reply.code(404).send({ error: 'Session not found' })

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

    // Stream AI response via SSE
    reply.raw.setHeader('Content-Type', 'text/event-stream')
    reply.raw.setHeader('Cache-Control', 'no-cache')
    reply.raw.setHeader('Connection', 'keep-alive')

    const { stream, messageId } = await generateAIResponse({
      session,
      userMessage: body.content,
      orgId: org.id
    })

    for await (const chunk of stream) {
      reply.raw.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`)
    }

    reply.raw.write(`data: ${JSON.stringify({ done: true, message_id: messageId })}\n\n`)
    reply.raw.end()
  })
}
