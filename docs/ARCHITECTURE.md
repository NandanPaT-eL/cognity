# Cognity — System Architecture

## High-Level Overview

```
Internet
   │
   ▼
[jsDelivr CDN] ── SDK JS file served globally
   │
   ▼
[Railway / Render] ── Fastify API (Node.js + TypeScript)
   │
   ├──► [Neon.tech]       PostgreSQL — persistent data
   ├──► [Upstash Redis]   Sessions cache, rate limiting
   ├──► [Pinecone]        Vector store for RAG
   └──► [Inngest]         Async background jobs

[Vercel] ── Next.js Dashboard
   │
   └──► [Clerk]           Auth (JWT)

[Uploadthing] ── File storage + CDN
[Gemini API]  ── LLM (free tier) + Embeddings (free tier)
```

## Components

### 1. Backend API (apps/api)
- Runtime: Node.js 20 LTS
- Framework: Fastify + TypeScript
- Handles all business logic, AI orchestration, session management
- Communicates with PostgreSQL, Redis, Pinecone, Gemini, Inngest

### 2. SDK (packages/sdk)
- Vanilla TypeScript compiled to ESM
- Injected via one-line script tag into any SaaS product
- Renders chat widget using Shadow DOM
- Tracks user activity and idle state
- Streams AI responses token by token

### 3. Dashboard (apps/dashboard)
- Next.js 14 App Router
- Protected by Clerk authentication
- SaaS company portal: doc upload, goal config, analytics
- Communicates with API only — no direct DB access

### 4. Database Layer
- PostgreSQL (Neon): all structured data
- Redis (Upstash): active sessions, rate limit counters
- Pinecone: document embeddings for RAG retrieval

## Data Flow — Chat Message

```
User types message in SDK widget
        ↓
SDK POST /v1/sessions/:id/messages
        ↓
API validates API key
        ↓
API embeds user message (Gemini text-embedding-004)
        ↓
API queries Pinecone for top 5 similar doc chunks (filtered by org_id)
        ↓
API fetches last 10 messages from PostgreSQL
        ↓
API builds prompt (system + context + history + user message)
        ↓
API streams response from Gemini 1.5 Flash via SSE
        ↓
SDK renders tokens in widget as they arrive
        ↓
API stores full response in PostgreSQL
```

## Data Flow — Document Ingestion

```
SaaS company uploads file in Dashboard
        ↓
File stored in Uploadthing CDN
        ↓
API creates document record (status: pending)
        ↓
Inngest job triggered (document/process)
        ↓
Job downloads file, extracts text
        ↓
Text chunked (512 tokens, 50 overlap)
        ↓
Each chunk embedded via Gemini text-embedding-004
        ↓
Vectors upserted to Pinecone with org_id metadata
        ↓
Document status updated to 'done'
```

## Scalability Decisions

- **Multi-tenancy**: all data filtered by org_id at service layer
- **Rate limiting**: Redis sliding window prevents abuse
- **Streaming**: SSE prevents timeout on long AI responses
- **Async jobs**: Inngest decouples embedding from upload request
- **Connection pooling**: pg Pool reuses PostgreSQL connections
- **CDN**: SDK served via jsDelivr — no origin load for JS delivery
