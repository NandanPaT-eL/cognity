import path from 'path'
import { fileURLToPath } from 'url'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import { clerkPlugin } from '@clerk/fastify'
import { sessionRoutes } from './routes/sessions'
import { messageRoutes } from './routes/messages'
import { eventRoutes } from './routes/events'
import { goalRoutes } from './routes/goals'
import { documentRoutes } from './routes/documents'
import { analyticsRoutes } from './routes/analytics'
import { orgRoutes } from './routes/org'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = Fastify({ logger: true })

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
})

// ─── SDK / public routes (any origin) ────────────────────────────────────
app.register(sessionRoutes,  { prefix: '/v1' })
app.register(messageRoutes,  { prefix: '/v1' })
app.register(eventRoutes,    { prefix: '/v1' })

// ─── Health check ────────────────────────────────────────────────────────
app.get('/health', async () => ({ status: 'ok', version: '1.0.0' }))

// ─── Start ───────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
