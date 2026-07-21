import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { db } from '../db'
import { organizations, usageCounters } from '../db/schema'
import { validateClerkJWT } from '../lib/auth'
import { getLimits } from '../lib/plan-limits'
import { billingWindowKey } from '../lib/utils'


const OriginsSchema = z.object({
  /** Origins to add (e.g. "https://app.example.com") */
  add:    z.array(z.string().url()).optional().default([]),
  /** Origins to remove */
  remove: z.array(z.string()).optional().default([]),
})

export async function orgRoutes(app: FastifyInstance) {

  // ─── GET /v1/org/me — org info including API key ──────────────────────
  app.get('/org/me', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    return reply.send({
      id:              org.id,
      name:            org.name,
      plan:            org.plan,
      api_key:         org.api_key,
      allowed_origins: org.allowed_origins ?? [],
    })
  })

  // ─── POST /v1/org/origins — add/remove allowed SDK origins ───────────
  app.post('/org/origins', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const { add, remove } = OriginsSchema.parse(req.body)

    const current = org.allowed_origins ?? []
    const next = [
      ...current.filter((o) => !remove.includes(o)),
      ...add.filter((o) => !current.includes(o)),
    ]

    const [updated] = await db
      .update(organizations)
      .set({ allowed_origins: next, updated_at: new Date() })
      .where(eq(organizations.id, org.id))
      .returning({ allowed_origins: organizations.allowed_origins })

    return reply.send({ allowed_origins: updated.allowed_origins })
  })

  // ─── POST /v1/org/rotate-key — generate a new API key ─────────────────
  app.post('/org/rotate-key', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const newKey = `cog_${randomUUID().replace(/-/g, '')}`

    const [updated] = await db
      .update(organizations)
      .set({ api_key: newKey, updated_at: new Date() })
      .where(eq(organizations.id, org.id))
      .returning({ api_key: organizations.api_key })

    return reply.send({ api_key: updated.api_key })
  })

  // ─── GET /v1/org/usage — current month usage vs plan limits ──────────
  app.get('/org/usage', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const month  = billingWindowKey(org.plan_expires_at, org.plan)
    const limits = getLimits(org.plan)

    // Upsert to ensure a row exists so the SELECT always returns data
    await db
      .insert(usageCounters)
      .values({ org_id: org.id, month, trigger_count: 0, mau_count: 0 })
      .onConflictDoNothing()

    const [counter] = await db
      .select({
        trigger_count: usageCounters.trigger_count,
        mau_count:     usageCounters.mau_count,
      })
      .from(usageCounters)
      .where(and(eq(usageCounters.org_id, org.id), eq(usageCounters.month, month)))
      .limit(1)

    return reply.send({
      month,
      plan:          org.plan,
      trigger_count: counter?.trigger_count ?? 0,
      mau_count:     counter?.mau_count     ?? 0,
      limits: {
        monthly_triggers: limits.monthly_triggers,
        mau:              limits.mau,
        documents:        limits.documents,
      },
    })
  })
  // ─── PATCH /v1/org/me — update org name ───────────────────────────────
  const PatchOrgSchema = z.object({
    name: z.string().min(1).max(100),
  })

  app.patch('/org/me', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const { name } = PatchOrgSchema.parse(req.body)

    const [updated] = await db
      .update(organizations)
      .set({ name, updated_at: new Date() })
      .where(eq(organizations.id, org.id))
      .returning({
        id:      organizations.id,
        name:    organizations.name,
        plan:    organizations.plan,
        api_key: organizations.api_key,
      })

    return reply.send(updated)
  })
}
