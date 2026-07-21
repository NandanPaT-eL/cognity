import path from 'path'
import { fileURLToPath } from 'url'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import rawBody from 'fastify-raw-body'
import { clerkPlugin } from '@clerk/fastify'
import { sessionRoutes } from './routes/sessions'
import { messageRoutes } from './routes/messages'
import { eventRoutes } from './routes/events'
import { goalRoutes } from './routes/goals'
import { documentRoutes } from './routes/documents'
import { analyticsRoutes } from './routes/analytics'
import { orgRoutes } from './routes/org'
import { billingRoutes, webhookRoutes } from './routes/billing'
import { tourRoutes, publicTourRoutes } from './routes/tours'
import { expireOverduePlans } from './lib/expire-plans'
import inngestFastify from 'inngest/fastify'
import { inngest } from './lib/inngest'
import { processDocument } from './services/embeddings'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = Fastify({ logger: true })

// ─── Raw body — required for Stripe webhook signature verification ────────
// Must be registered before any route that reads req.body, so it runs first.
await app.register(rawBody, {
  field:    'rawBody',
  global:   false,   // only opt-in per route via config.rawBody = true
  encoding: false,   // keep as Buffer
  runFirst: true,
})

// ─── Allowed origins for dashboard routes ────────────────────────────────
const defaultDashboardOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://cognity.com.au',
  'https://www.cognity.com.au',
  'https://dashboard.cognity.com.au',
])
const configuredOrigins = new Set(
  (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
)
const dashboardOrigins = configuredOrigins.size > 0 ? configuredOrigins : defaultDashboardOrigins

// ─── SDK static files (registered BEFORE clerkPlugin) ────────────────────
// Serves packages/sdk/dist/* at /sdk/*
// SDK_DIST_PATH env var overrides the relative path for flexibility.
// Default: two levels up from apps/api/dist → project root → packages/sdk/dist
const sdkDistPath = path.resolve(
  process.env.SDK_DIST_PATH
    ? path.resolve(process.cwd(), process.env.SDK_DIST_PATH)
    : path.resolve(__dirname, '../../packages/sdk/dist')
)
app.register(staticFiles, {
  root: sdkDistPath,
  prefix: '/sdk/',
  decorateReply: false,
})

// ─── Plugins ─────────────────────────────────────────────────────────────
app.register(clerkPlugin)

app.register(cors, {
  // Allow all origins — SDK requests come from any SaaS customer domain.
  // Dashboard routes are additionally protected by Clerk JWT.
  // For defense-in-depth, dashboard route group also checks origin via hook.
  origin: true,
  credentials: true,
})

app.register(multipart, {
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 1,
    fields: 10,
    parts: 12
  }
})

// ─── Stripe webhook — public route (no dashboard origin check) ────────────
// Must be before the dashboard scope so it's not blocked by the origin hook.
app.register(async (webhookApp) => {
  webhookApp.register(webhookRoutes, { prefix: '/v1' })
}, { prefix: '' })

// ─── Inngest — background job handler (document embeddings) ───────────────
// Inngest Cloud POSTs here to execute registered functions.
// Deploy docs: point Inngest app to https://your-api.railway.app/api/inngest
app.register(inngestFastify, {
  client: inngest,
  functions: [processDocument],
})

// ─── Dashboard routes (Clerk JWT + origin-restricted) ────────────────────
app.register(async (dashApp) => {
  dashApp.addHook('onRequest', async (req, reply) => {
    const origin = req.headers.origin
    if (origin && !dashboardOrigins.has(origin)) {
      return reply.code(403).send({ error: 'Origin not allowed' })
    }
  })

  dashApp.register(goalRoutes,      { prefix: '/v1' })
  dashApp.register(documentRoutes,  { prefix: '/v1' })
  dashApp.register(analyticsRoutes, { prefix: '/v1' })
  dashApp.register(orgRoutes,       { prefix: '/v1' })
  dashApp.register(billingRoutes,   { prefix: '/v1' })
  dashApp.register(tourRoutes,      { prefix: '/v1' })
})

// ─── SDK / public routes (any origin) ────────────────────────────────────
app.register(sessionRoutes,     { prefix: '/v1' })
app.register(messageRoutes,     { prefix: '/v1' })
app.register(eventRoutes,       { prefix: '/v1' })
app.register(publicTourRoutes,  { prefix: '/v1' })

// ─── Health check ────────────────────────────────────────────────────────
app.get('/health', async () => ({ status: 'ok', version: '1.0.0' }))

// ─── Start ───────────────────────────────────────────────────────────────
const start = async () => {
  try {
    // Run plan expiry check on startup, then every 6 hours
    expireOverduePlans().catch((err) => app.log.error(err))
    setInterval(() => expireOverduePlans().catch((err) => app.log.error(err)), 6 * 60 * 60 * 1000)

    await app.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
