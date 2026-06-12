# Contributing to Cognity

## Prerequisites
- Node.js 20 LTS
- npm 10+
- PostgreSQL client (for local DB, or use Neon free tier)

## Local Setup

```bash
# Clone repo
git clone https://github.com/your-org/cognity.git
cd cognity

# Install all dependencies (monorepo)
npm install

# Copy env file and fill in values
cp .env.example .env

# Run database migrations
npm run db:migrate

# Start all apps in dev mode
npm run dev
```

- API runs at: http://localhost:3001
- Dashboard runs at: http://localhost:3000

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — auto-deploys to Railway + Vercel |
| `dev` | Integration branch — PRs merge here first |
| `feature/*` | New features — branch from dev |
| `fix/*` | Bug fixes |
| `chore/*` | Deps, config, docs |

## Pull Request Rules
- All PRs must target `dev`, not `main`
- PR title must follow: `feat:`, `fix:`, `chore:`, `docs:`
- At least one approval required before merge
- `main` is only updated via PRs from `dev` after testing

## Running Tests

```bash
# All tests
npm run test

# API tests only
cd apps/api && npm run test
```

## Code Style
- TypeScript strict mode enabled — no `any` types
- Zod validation on all API inputs
- No direct database access from route handlers — use service functions
- All secrets via environment variables — never hardcoded
