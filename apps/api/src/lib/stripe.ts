import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

/** Maps plan names to their Stripe Price IDs. */
export const STRIPE_PRICE_IDS: Record<'starter' | 'growth' | 'lifetime', string> = {
  starter:
    process.env.STRIPE_PRICE_STARTER
    ?? process.env.STRIPE_PRICE_STARTER_MONTHLY
    ?? '',
  growth:
    process.env.STRIPE_PRICE_GROWTH
    ?? process.env.STRIPE_PRICE_GROWTH_MONTHLY
    ?? '',
  lifetime: process.env.STRIPE_PRICE_LIFETIME ?? '',
}

/** Plan names that use recurring subscriptions (not one-time payments). */
export const SUBSCRIPTION_PLANS = new Set<string>(['starter', 'growth'])
