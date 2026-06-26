import type Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { organizations } from '../db/schema'

type CheckoutPlan = 'starter' | 'growth' | 'lifetime'

function stripeId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null
  return typeof value === 'string' ? value : value.id
}

/**
 * Apply a completed Checkout session to the matching organization row.
 * Returns the updated org id, or null if metadata is missing / org not found.
 */
export async function applyCheckoutSessionToOrg(session: Stripe.Checkout.Session): Promise<string | null> {
  const orgId       = session.metadata?.org_id
  const plan        = session.metadata?.plan as CheckoutPlan | undefined
  const clerkUserId = session.metadata?.clerk_user_id

  if (!orgId || !plan) return null

  const [existing] = await db
    .select({ id: organizations.id, clerk_user_id: organizations.clerk_user_id })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1)

  if (!existing) return null

  // Reject if session was created for a different Clerk account.
  if (clerkUserId && existing.clerk_user_id && clerkUserId !== existing.clerk_user_id) {
    return null
  }

  const customerId     = stripeId(session.customer)
  const subscriptionId = stripeId(session.subscription)

  await db
    .update(organizations)
    .set({
      plan,
      ...(customerId ? { stripe_customer_id: customerId } : {}),
      stripe_subscription_id: subscriptionId,
      updated_at: new Date(),
    })
    .where(eq(organizations.id, orgId))

  return orgId
}

/** Metadata attached to every Checkout session so Stripe ↔ Cognity stay linked. */
export function checkoutMetadata(org: { id: string; clerk_user_id: string | null }, plan: CheckoutPlan) {
  return {
    org_id:        org.id,
    plan,
    clerk_user_id: org.clerk_user_id ?? '',
  }
}
