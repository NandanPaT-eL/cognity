import { FastifyRequest } from 'fastify'
import { getAuth, clerkClient } from '@clerk/fastify'
import { db } from '../db'
import { organizations } from '../db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { sendWelcomeEmail } from './email'

export async function validateApiKey(req: FastifyRequest) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  const apiKey = authHeader.replace('Bearer ', '')

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.api_key, apiKey))
    .limit(1)

  if (!org) return null

  // ─── Origin enforcement ───────────────────────────────────────────────
  // Only enforced when the org has explicitly configured allowed_origins AND
  // the request carries an Origin header (i.e. a browser SDK request).
  // Server-to-server calls without an Origin header always pass.
  if (org.allowed_origins && org.allowed_origins.length > 0) {
    const origin = req.headers.origin
    if (origin && !org.allowed_origins.includes(origin)) {
      return null  // Treat as invalid — caller will return 401
    }
  }

  return org
}

export async function validateClerkJWT(req: FastifyRequest) {
  const auth = getAuth(req)
  if (!auth.userId) return null

  // Look up org by clerk_user_id
  const [existing] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.clerk_user_id, auth.userId))
    .limit(1)

  if (existing) return existing

  // Auto-provision: first time this user hits a dashboard route,
  // create their org row so the dashboard works immediately.
  let userName   = 'My Organization'
  let userEmail  = ''
  try {
    const user  = await clerkClient.users.getUser(auth.userId)
    const first = user.firstName ?? ''
    const last  = user.lastName  ?? ''
    const full  = `${first} ${last}`.trim()
    userName   = full || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'My Organization'
    userEmail  = user.emailAddresses[0]?.emailAddress ?? ''
  } catch {
    // Non-fatal — fall back to default name
  }

  const [created] = await db
    .insert(organizations)
    .values({
      clerk_user_id: auth.userId,
      name:          userName,
      plan:          'free',
      api_key:       `cog_${randomUUID().replace(/-/g, '')}`,
    })
    .onConflictDoNothing()
    .returning()

  // Handle race condition: if another request inserted first, fetch it
  if (!created) {
    const [raced] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.clerk_user_id, auth.userId))
      .limit(1)
    return raced ?? null
  }

  // Send welcome email — non-fatal
  if (userEmail) {
    sendWelcomeEmail(userEmail, userName).catch((err) => {
      console.error('[email] Failed to send welcome email:', err)
    })
  }

  return created
}
