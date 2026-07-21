import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq, and, asc, count, max, sql } from 'drizzle-orm'
import { db } from '../db'
import { tours, tourSteps } from '../db/schema'
import { validateClerkJWT, validateApiKey } from '../lib/auth'
import { getLimits } from '../lib/plan-limits'

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const CreateTourSchema = z.object({
  name:     z.string().min(1).max(200),
  page_url: z.string().min(1).max(2000),
})

const UpdateTourSchema = z.object({
  name:     z.string().min(1).max(200).optional(),
  page_url: z.string().min(1).max(2000).optional(),
  status:   z.enum(['draft', 'published']).optional(),
})

const CreateStepSchema = z.object({
  fingerprint: z.string().min(1),  // JSON string of ElementFingerprint
  title:       z.string().min(1).max(300),
  body_text:   z.string().min(1).max(2000),
  position:    z.enum(['top', 'bottom', 'left', 'right']).default('bottom'),
  page_url:    z.string().optional(),
})

const UpdateStepSchema = z.object({
  title:    z.string().min(1).max(300).optional(),
  body_text: z.string().min(1).max(2000).optional(),
  position:  z.enum(['top', 'bottom', 'left', 'right']).optional(),
})

const ReorderSchema = z.object({
  stepIds: z.array(z.string().uuid()),
})

// ─── Route plugin ─────────────────────────────────────────────────────────────

export async function tourRoutes(app: FastifyInstance) {

  // ── GET /v1/tours — list all tours for the org ────────────────────────────
  app.get('/tours', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const rows = await db
      .select({
        id:           tours.id,
        name:         tours.name,
        page_url:     tours.page_url,
        status:       tours.status,
        trigger_type: tours.trigger_type,
        created_at:   tours.created_at,
        updated_at:   tours.updated_at,
        step_count:   count(tourSteps.id),
      })
      .from(tours)
      .leftJoin(tourSteps, eq(tourSteps.tour_id, tours.id))
      .where(eq(tours.org_id, org.id))
      .groupBy(tours.id)
      .orderBy(asc(tours.created_at))

    return reply.send({ tours: rows })
  })

  // ── POST /v1/tours — create a tour ────────────────────────────────────────
  app.post('/tours', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const body = CreateTourSchema.parse(req.body)

    const [tour] = await db
      .insert(tours)
      .values({ org_id: org.id, name: body.name, page_url: body.page_url })
      .returning()

    return reply.code(201).send({ tour })
  })

  // ── GET /v1/tours/:id — get one tour with steps ───────────────────────────
  app.get('/tours/:id', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const { id } = req.params as { id: string }

    const tour = await db.query.tours.findFirst({
      where: (t, { and, eq }) => and(eq(t.id, id), eq(t.org_id, org.id)),
    })
    if (!tour) return reply.code(404).send({ error: 'Tour not found' })

    const steps = await db.query.tourSteps.findMany({
      where: (s, { eq }) => eq(s.tour_id, id),
      orderBy: (s, { asc }) => [asc(s.step_order)],
    })

    return reply.send({ tour: { ...tour, steps } })
  })

  // ── PATCH /v1/tours/:id — update a tour ──────────────────────────────────
  app.patch('/tours/:id', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const { id } = req.params as { id: string }
    const body    = UpdateTourSchema.parse(req.body)

    // If publishing, check the tour limit
    if (body.status === 'published') {
      const limits = getLimits(org.plan)
      if (limits.tours !== -1) {
        const [{ total }] = await db
          .select({ total: count() })
          .from(tours)
          .where(and(eq(tours.org_id, org.id), eq(tours.status, 'published')))
        if (Number(total) >= limits.tours) {
          return reply.code(402).send({
            error: 'Published tour limit reached',
            upgrade_url: 'https://cognity.com.au/#pricing',
          })
        }
      }
    }

    const existing = await db.query.tours.findFirst({
      where: (t, { and, eq }) => and(eq(t.id, id), eq(t.org_id, org.id)),
    })
    if (!existing) return reply.code(404).send({ error: 'Tour not found' })

    const [updated] = await db
      .update(tours)
      .set({ ...body, updated_at: new Date() })
      .where(and(eq(tours.id, id), eq(tours.org_id, org.id)))
      .returning()

    return reply.send({ tour: updated })
  })

  // ── DELETE /v1/tours/:id — delete a tour (cascades steps) ────────────────
  app.delete('/tours/:id', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const { id } = req.params as { id: string }

    const tour = await db.query.tours.findFirst({
      where: (t, { and, eq }) => and(eq(t.id, id), eq(t.org_id, org.id)),
    })
    if (!tour) return reply.code(404).send({ error: 'Tour not found' })

    // Explicitly delete steps first (guards against missing cascade on live DB)
    await db.delete(tourSteps).where(eq(tourSteps.tour_id, id))
    await db.delete(tours).where(eq(tours.id, id))

    return reply.send({ ok: true })
  })



  // ── PATCH /v1/tours/:id/steps/:stepId — edit a step ──────────────────────
  app.patch('/tours/:id/steps/:stepId', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const { id, stepId } = req.params as { id: string; stepId: string }
    const body           = UpdateStepSchema.parse(req.body)

    // Verify ownership via tour
    const tour = await db.query.tours.findFirst({
      where: (t, { and, eq }) => and(eq(t.id, id), eq(t.org_id, org.id)),
    })
    if (!tour) return reply.code(404).send({ error: 'Tour not found' })

    const existing = await db.query.tourSteps.findFirst({
      where: (s, { and, eq }) => and(eq(s.id, stepId), eq(s.tour_id, id)),
    })
    if (!existing) return reply.code(404).send({ error: 'Step not found' })

    const [updated] = await db
      .update(tourSteps)
      .set(body)
      .where(and(eq(tourSteps.id, stepId), eq(tourSteps.tour_id, id)))
      .returning()

    return reply.send({ step: updated })
  })

  // ── DELETE /v1/tours/:id/steps/:stepId — delete a step ───────────────────
  app.delete('/tours/:id/steps/:stepId', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const { id, stepId } = req.params as { id: string; stepId: string }

    // Verify tour ownership before deleting the step
    const tour = await db.query.tours.findFirst({
      where: (t, { and, eq }) => and(eq(t.id, id), eq(t.org_id, org.id)),
    })
    if (!tour) return reply.code(404).send({ error: 'Tour not found' })

    await db
      .delete(tourSteps)
      .where(and(eq(tourSteps.id, stepId), eq(tourSteps.tour_id, id)))

    return reply.send({ ok: true })
  })

  // ── POST /v1/tours/:id/reorder — bulk reorder steps ──────────────────────
  app.post('/tours/:id/reorder', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const { id }  = req.params as { id: string }
    const { stepIds } = ReorderSchema.parse(req.body)

    const tour = await db.query.tours.findFirst({
      where: (t, { and, eq }) => and(eq(t.id, id), eq(t.org_id, org.id)),
    })
    if (!tour) return reply.code(404).send({ error: 'Tour not found' })

    // Bulk update step_order using array index (1-based)
    await Promise.all(
      stepIds.map((stepId, index) =>
        db
          .update(tourSteps)
          .set({ step_order: index + 1 })
          .where(and(eq(tourSteps.id, stepId), eq(tourSteps.tour_id, id)))
      )
    )

    await db.update(tours).set({ updated_at: new Date() }).where(eq(tours.id, id))

    return reply.send({ ok: true })
  })
}

// ─── Public route (API-key authenticated) ────────────────────────────────────

export async function publicTourRoutes(app: FastifyInstance) {
  // ── POST /v1/tours/:id/steps — add a step (called by SDK picker on customer site) ──
  app.post('/tours/:id/steps', async (req, reply) => {
    const org = await validateApiKey(req)
    if (!org) return reply.code(401).send({ error: 'Invalid API key' })

    const { id } = req.params as { id: string }
    const body    = CreateStepSchema.parse(req.body)

    const tour = await db.query.tours.findFirst({
      where: (t, { and, eq }) => and(eq(t.id, id), eq(t.org_id, org.id)),
    })
    if (!tour) return reply.code(404).send({ error: 'Tour not found' })

    // Determine next step_order: max(step_order) + 1 for this tour, or 1 if none
    const [{ maxOrder }] = await db
      .select({ maxOrder: max(tourSteps.step_order) })
      .from(tourSteps)
      .where(eq(tourSteps.tour_id, id))

    const nextOrder = (maxOrder ?? 0) + 1

    const [step] = await db
      .insert(tourSteps)
      .values({
        tour_id:     id,
        step_order:  nextOrder,
        fingerprint: body.fingerprint,
        title:       body.title,
        body_text:   body.body_text,
        position:    body.position,
        page_url:    body.page_url ?? null,
      })
      .returning()

    // Mark tour as updated
    await db.update(tours).set({ updated_at: new Date() }).where(eq(tours.id, id))

    return reply.code(201).send({ step })
  })

  // GET /v1/tours/active
  // Only returns tours with trigger_type = 'page_load' AND matching the
  // current page path sent by the SDK. Manual tours are never returned here.
  app.get('/tours/active', async (req, reply) => {
    const org = await validateApiKey(req)
    if (!org) return reply.code(401).send({ error: 'Invalid API key' })

    const { page_path } = req.query as { page_path?: string }
    if (!page_path) return reply.send(null)

    const tour = await db.query.tours.findFirst({
      where: (t, { and, eq }) =>
        and(
          eq(t.org_id, org.id),
          eq(t.status, 'published'),
          eq(t.trigger_type, 'page_load'),
          eq(t.page_url, page_path)      // must match the page the user is on
        ),
    })

    if (!tour) return reply.send(null)

    const steps = await db.query.tourSteps.findMany({
      where: (s, { eq }) => eq(s.tour_id, tour.id),
      orderBy: (s, { asc }) => [asc(s.step_order)],
    })

    return reply.send({ ...tour, steps })
  })
}
