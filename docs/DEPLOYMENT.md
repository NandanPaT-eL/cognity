# Cognity — Deployment Guide

## Zero-Cost Services Used

| Layer | Service | Free Tier |
|-------|---------|-----------|
| PostgreSQL | Neon.tech | 10GB, 100hrs compute/month |
| Redis | Upstash | 10,000 commands/day |
| Vector Store | Pinecone | 100k vectors, 1 index |
| API Hosting | Railway.app | $5 credit/month |
| Dashboard | Vercel | Unlimited hobby projects |
| Auth | Clerk | 10,000 MAUs |
| Background Jobs | Inngest | 50k runs/month |
| File Storage | Uploadthing | 2GB storage |
| SDK CDN | jsDelivr | Free, global |
| Monitoring | Sentry | 5,000 errors/month |
| AI (LLM + Embed) | Gemini API | 15 RPM, 1M tokens/day |

**Estimated monthly cost at beta scale:** ~$0-10 AUD

---

## Step-by-Step Deployment

### 1. PostgreSQL — Neon.tech
1. Create account at neon.tech
2. Create new project → name it `cognity`
3. Copy the connection string
4. Set `DATABASE_URL` in your environment
5. Run `npm run db:migrate` to apply schema

### 2. Redis — Upstash
1. Create account at upstash.com
2. Create new Redis database → region: closest to your API host
3. Copy REST URL and REST Token
4. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### 3. Pinecone
1. Create account at pinecone.io
2. Create index: name `cognity-docs`, dimensions `768`, metric `cosine`
3. Copy API key
4. Set `PINECONE_API_KEY` and `PINECONE_INDEX_NAME`

### 4. Gemini API
1. Go to aistudio.google.com
2. Create API key
3. Set `GEMINI_API_KEY`
4. Models used: `gemini-1.5-flash` (chat), `text-embedding-004` (embeddings)

### 5. Clerk
1. Create account at clerk.com
2. Create new application
3. Copy publishable key and secret key
4. Set `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

### 6. Inngest
1. Create account at inngest.com
2. Create new app
3. Copy event key and signing key
4. Set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`
5. Register your functions by pointing Inngest to `https://your-api.railway.app/api/inngest`

### 7. Uploadthing
1. Create account at uploadthing.com
2. Create new app
3. Copy secret and app ID
4. Set `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID`

### 8. API — Railway.app
1. Create account at railway.app
2. New project → Deploy from GitHub repo → select `apps/api`
3. Add all environment variables from `.env.example`
4. Railway auto-deploys on every push to main

### 9. Dashboard — Vercel
1. Create account at vercel.com
2. Import GitHub repo → select `apps/dashboard`
3. Add environment variables
4. Vercel auto-deploys on every push to main

### 10. SDK — Publish to npm
```bash
cd packages/sdk
npm run build
npm publish --access public
```
SDK then available at: `https://cdn.jsdelivr.net/npm/@cognity/sdk/dist/index.js`

---

## Environment Variables Checklist
See `.env.example` in the root of the repo for all required variables.
