import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { activationGoals } from '../db/schema'
import { validateClerkJWT } from '../lib/auth'

const ActivationGoalSchema = z.object({
  event_name: z.string().min(1).max(100),
  description: z.string().min(1).max(255)
})

export async function goalRoutes(app: FastifyInstance) {
  app.get('/activation-goal', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const activationGoal = await db.query.activationGoals.findFirst({
      where: (goal, { eq }) => eq(goal.org_id, org.id),
      orderBy: (goal, { desc }) => [desc(goal.created_at)]
    })

    return reply.send({ activation_goal: activationGoal ?? null })
  })

  app.put('/activation-goal', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const body = ActivationGoalSchema.parse(req.body)

    await db.delete(activationGoals).where(eq(activationGoals.org_id, org.id))

    const [activationGoal] = await db.insert(activationGoals).values({
      org_id: org.id,
      event_name: body.event_name,
      description: body.description
    }).returning()

    return reply.send({ activation_goal: activationGoal })
  })
}
