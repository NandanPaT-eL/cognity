import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq, count } from 'drizzle-orm'
import { db } from '../db'
import { organizations } from '../db/schema'
import { stripe, STRIPE_PRICE_IDS, SUBSCRIPTION_PLANS } from '../lib/stripe'
import { applyCheckoutSessionToOrg, checkoutMetadata } from '../lib/billing-sync'
import { validateClerkJWT } from '../lib/auth'
import {
  sendPaymentFailedEmail,
  sendPlanDowngradedEmail,
} from '../lib/email'
import { clerkClient } from '@clerk/fastify'

const CheckoutSchema = z.object({
  plan: z.enum(['starter', 'growth', 'lifetime']),
})

const ConfirmCheckoutSchema = z.object({
  session_id: z.string().min(1),
})

/** Maximum number of lifetime deal spots available. */
const LIFETIME_CAP = 50

// ─── Dashboard billing routes ──────────────────────────────────────────────
// Checkout and portal require Clerk JWT and are registered inside the
// dashboard-origin scope in index.ts.

export async function billingRoutes(app: FastifyInstance) {

  // POST /v1/billing/checkout
  app.post('/billing/checkout', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const { plan } = CheckoutSchema.parse(req.body)

    // ── Lifetime deal cap ─────────────────────────────────────────────────
    if (plan === 'lifetime') {
      const [{ total }] = await db
        .select({ total: count() })
        .from(organizations)
        .where(eq(organizations.plan, 'lifetime'))

      if (Number(total) >= LIFETIME_CAP) {
        return reply.code(410).send({
          error: `Lifetime deal is no longer available — all ${LIFETIME_CAP} spots have been claimed.`,
        })
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    const priceId = STRIPE_PRICE_IDS[plan]
    if (!priceId) {
      return reply.code(500).send({ error: `No Stripe price configured for plan: ${plan}` })
    }

    const isSubscription = SUBSCRIPTION_PLANS.has(plan)
    const dashUrl    = process.env.DASHBOARD_URL ?? 'http://localhost:3000/dashboard'
    const successUrl = `${dashUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl  = `${dashUrl}?checkout=cancelled`
    const meta       = checkoutMetadata(org, plan)

    let customerEmail: string | undefined
    if (!org.stripe_customer_id) {
      try {
        const user = await clerkClient.users.getUser(org.clerk_user_id!)
        customerEmail = user.emailAddresses[0]?.emailAddress
      } catch {
        // Stripe Checkout will collect email if unavailable
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode:        isSubscription ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url:  cancelUrl,
      client_reference_id: org.id,
      ...(org.stripe_customer_id
        ? { customer: org.stripe_customer_id }
        : customerEmail
          ? { customer_email: customerEmail }
          : {}),
      metadata: meta,
      subscription_data: isSubscription
        ? { metadata: meta }
        : undefined,
      payment_intent_data: !isSubscription
        ? { metadata: meta }
        : undefined,
    })

    return reply.send({ url: session.url })
  })

  // POST /v1/billing/checkout/confirm
  // Called after redirect from Stripe — verifies the session belongs to the
  // signed-in user and syncs plan + stripe_customer_id (webhook fallback).
  app.post('/billing/checkout/confirm', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const { session_id } = ConfirmCheckoutSchema.parse(req.body)

    let session
    try {
      session = await stripe.checkout.sessions.retrieve(session_id)
    } catch {
      return reply.code(404).send({ error: 'Checkout session not found' })
    }

    if (session.metadata?.org_id !== org.id) {
      return reply.code(403).send({ error: 'This payment does not belong to your account' })
    }

    const sessionClerkId = session.metadata?.clerk_user_id
    if (sessionClerkId && org.clerk_user_id && sessionClerkId !== org.clerk_user_id) {
      return reply.code(403).send({ error: 'This payment does not belong to your account' })
    }

    if (session.payment_status !== 'paid') {
      return reply.code(400).send({ error: 'Payment not completed yet' })
    }

    const syncedOrgId = await applyCheckoutSessionToOrg(session)
    if (!syncedOrgId) {
      return reply.code(422).send({ error: 'Could not link payment to your account' })
    }

    const [updated] = await db
      .select({
        plan:                 organizations.plan,
        stripe_customer_id:   organizations.stripe_customer_id,
        stripe_subscription_id: organizations.stripe_subscription_id,
      })
      .from(organizations)
      .where(eq(organizations.id, syncedOrgId))
      .limit(1)

    return reply.send({
      ok:                   true,
      plan:                 updated?.plan ?? org.plan,
      stripe_customer_id:   updated?.stripe_customer_id ?? null,
      stripe_subscription_id: updated?.stripe_subscription_id ?? null,
    })
  })

  // GET /v1/billing/portal
  app.get('/billing/portal', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    if (!org.stripe_customer_id) {
      return reply.code(400).send({ error: 'No billing account found. Please subscribe first.' })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   org.stripe_customer_id,
      return_url: process.env.DASHBOARD_URL ?? 'https://cognity.com.au/dashboard',
    })

    return reply.send({ url: portalSession.url })
  })
}

// ─── Public webhook route ──────────────────────────────────────────────────
// Registered in the public scope (no origin check) in index.ts so Stripe can
// reach it without browser-origin headers.

export async function webhookRoutes(app: FastifyInstance) {

  app.post(
    '/billing/webhook',
    { config: { rawBody: true } },
    async (req, reply) => {
      const sig    = req.headers['stripe-signature']
      const secret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

      if (!sig) return reply.code(400).send({ error: 'Missing stripe-signature header' })

      let event
      try {
        const raw: Buffer = (req as unknown as { rawBody: Buffer }).rawBody
        event = stripe.webhooks.constructEvent(raw, sig, secret)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        app.log.warn(`Stripe webhook verification failed: ${msg}`)
        return reply.code(400).send({ error: `Webhook error: ${msg}` })
      }

      // ── checkout.session.completed ────────────────────────────────────
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const synced  = await applyCheckoutSessionToOrg(session)
        if (!synced) {
          app.log.warn(
            `checkout.session.completed: could not sync org (session ${session.id}, metadata ${JSON.stringify(session.metadata)})`
          )
        }
      }

      // ── customer.subscription.deleted ─────────────────────────────────
      else if (event.type === 'customer.subscription.deleted') {
        const sub        = event.data.object
        const customerId = sub.customer as string

        // Downgrade to free and clear subscription ID
        const [downgraded] = await db
          .update(organizations)
          .set({ plan: 'free', stripe_subscription_id: null, updated_at: new Date() })
          .where(eq(organizations.stripe_customer_id, customerId))
          .returning({ id: organizations.id, clerk_user_id: organizations.clerk_user_id })

        // Send plan-downgraded email
        if (downgraded?.clerk_user_id) {
          try {
            const user  = await clerkClient.users.getUser(downgraded.clerk_user_id)
            const email = user.emailAddresses[0]?.emailAddress
            if (email) {
              await sendPlanDowngradedEmail(email)
            }
          } catch (err) {
            app.log.error(`Failed to send plan-downgraded email: ${String(err)}`)
          }
        }
      }

      // ── invoice.payment_failed ────────────────────────────────────────
      else if (event.type === 'invoice.payment_failed') {
        const invoice    = event.data.object
        const customerId = invoice.customer as string

        const [org] = await db
          .select({ id: organizations.id, clerk_user_id: organizations.clerk_user_id })
          .from(organizations)
          .where(eq(organizations.stripe_customer_id, customerId))
          .limit(1)

        if (org?.clerk_user_id) {
          try {
            const user  = await clerkClient.users.getUser(org.clerk_user_id)
            const email = user.emailAddresses[0]?.emailAddress
            if (email) {
              await sendPaymentFailedEmail(email)
            }
          } catch (err) {
            app.log.error(`Failed to send payment-failed email: ${String(err)}`)
          }
        }
      }

      return reply.send({ received: true })
    }
  )
}
