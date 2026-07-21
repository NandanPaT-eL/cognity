import { db } from '../db'
import { organizations } from '../db/schema'
import { sql } from 'drizzle-orm'

/**
 * Downgrades any org whose plan_expires_at is in the past and whose plan
 * is not 'free' or 'lifetime'. Call this on a schedule or on API startup.
 */
export async function expireOverduePlans() {
  const now = new Date()
  await db.update(organizations)
    .set({ plan: 'free', stripe_subscription_id: null, updated_at: now })
    .where(sql`${organizations.plan_expires_at} < ${now}
AND ${organizations.plan} NOT IN ('free', 'lifetime', 'beta', 'enterprise')`)
}
