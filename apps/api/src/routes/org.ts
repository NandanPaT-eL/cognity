import { FastifyInstance } from 'fastify'
import { validateClerkJWT } from '../lib/auth'

export async function orgRoutes(app: FastifyInstance) {
  // GET /v1/org/me — returns org info including API key for install page
  app.get('/org/me', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    return reply.send({
      id: org.id,
      name: org.name,
      api_key: org.api_key
    })
  })
}
