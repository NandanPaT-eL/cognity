/**
 * Returns the current billing window key for an org.
 *
 * For paid plans: derived from plan_expires_at (Stripe period end).
 * The key is the period start date as YYYY-MM-DD, which is unique per
 * billing cycle and anniversary-based — not calendar-month-based.
 *
 * For free / beta / null: falls back to YYYY-MM calendar month so
 * the usage_counters unique index (org_id, month) still works.
 *
 * Example: plan_expires_at = 2026-07-08 → key = "2026-06-08"
 */
export function billingWindowKey(
  planExpiresAt: Date | null | undefined,
  plan: string
): string {
  if (!planExpiresAt || plan === 'free' || plan === 'beta') {
    return new Date().toISOString().slice(0, 7)   // YYYY-MM calendar fallback
  }
  // Period start = period end minus exactly 1 month (UTC to avoid DST shift)
  const periodStart = new Date(planExpiresAt)
  periodStart.setUTCMonth(periodStart.getUTCMonth() - 1)
  return periodStart.toISOString().slice(0, 10)   // YYYY-MM-DD
}

/** @deprecated Use billingWindowKey() instead. Left for reference only. */
export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}
