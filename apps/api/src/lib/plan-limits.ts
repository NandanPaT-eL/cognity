export type Plan = 'free' | 'beta' | 'starter' | 'growth' | 'lifetime' | 'enterprise'

export interface PlanLimits {
  /** Max AI message triggers per billing month (-1 = unlimited) */
  monthly_triggers: number
  /** Max monthly active users tracked (-1 = unlimited) */
  mau: number
  /** Max uploaded document sources (-1 = unlimited) */
  documents: number
}

/**
 * Plan limits for Cognity.
 *
 * NOTE (beta period): free and beta plans are currently unrestricted on
 * triggers and MAU so teams can evaluate the product without hitting walls.
 * The only enforced limit is documents: 3, which distinguishes free from paid.
 *
 * 'beta' mirrors 'starter' quotas but is issued free of charge as a
 * promotional plan during the early-access period.
 */
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    monthly_triggers: -1,   // unrestricted during beta
    mau:              -1,   // unrestricted during beta
    documents:        3,
  },
  beta: {
    // Beta plan: same quota as Starter but issued at no cost.
    monthly_triggers: 2_000,
    mau:              5_000,
    documents:        20,
  },
  starter: {
    monthly_triggers: 2_000,
    mau:              5_000,
    documents:        20,
  },
  growth: {
    monthly_triggers: 10_000,
    mau:              25_000,
    documents:        100,
  },
  // Beta Lifetime Deal: promotional plan for first 50 beta purchasers.
  // After beta launch, holders are grandfathered onto Growth plan limits.
  // Limits here reflect the beta period entitlement.
  lifetime: {
    monthly_triggers: 5_000,
    mau:              25_000,
    documents:        50,
  },
  enterprise: {
    monthly_triggers: -1,
    mau:              -1,
    documents:        -1,
  },
}

/** Returns the limits for a given plan, falling back to free. */
export function getLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.free
}

/** Returns true if a count is within the plan limit (-1 = unlimited). */
export function withinLimit(used: number, limit: number): boolean {
  if (limit === -1) return true
  return used < limit
}
