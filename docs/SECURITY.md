# Cognity — Security Specification

## Authentication

### SDK Routes (public-facing)
- Auth via `Authorization: Bearer <org_api_key>` header
- API key is organisation-scoped — only allows session creation and event tracking
- Cannot access analytics, documents, or other org data
- Keys are rotatable from the dashboard at any time

### Dashboard Routes
- Auth via Clerk JWT
- JWT validated on every request at the middleware layer
- org_id extracted from JWT claims — never trusted from client headers alone

## Tenant Isolation
- ALL database queries filtered by org_id at the service layer (not just route layer)
- Pinecone queries use metadata filter `{ org_id: orgId }` — no cross-org vector leakage
- Validated in service functions before any DB or vector operation

## User Privacy
- End user IDs are SHA-256 hashed in the SDK before transmission — no PII sent to API
- No names, emails, or personal data stored in any table
- Metadata fields accept custom JSON but are never used in AI prompts directly

## Prompt Injection Protection
- User messages passed as the `user` turn only — never injected into the system prompt
- System prompt uses clear section labels to separate context from user input
- Retrieved document chunks are wrapped in clear delimiters in the prompt

## Rate Limiting
- Redis sliding window counter per composite key: `{event_type}:{session_id}`
- Messages: 30 req/session/minute → returns HTTP 429 with Retry-After header
- Events: 60 req/session/minute
- Documents: 10 uploads/org/day
- Analytics: 100 req/org/hour

## CORS
- API validates Origin header against a per-org whitelist stored in PostgreSQL
- SaaS company adds their product domain in the Cognity dashboard
- Requests from unlisted origins are rejected with HTTP 403

## Data Encryption
- All data in transit: TLS 1.2+ enforced by Neon, Upstash, and Render/Railway
- Data at rest: encrypted by Neon (AES-256) and Upstash by default
- API keys stored as plaintext (they are public-facing by design) — rotation is the mitigation

## Dependency Security
- `npm audit` run on every PR via CI
- Dependabot enabled for automatic security patch PRs
- No use of eval() or dynamic code execution anywhere in codebase

## Incident Response
- Sentry configured for all runtime errors with alert thresholds
- If API key is compromised: rotate from dashboard — old key invalidated immediately
- If database breach suspected: Neon supports point-in-time recovery
