# V1 Completion — Requirements

## Overview
Complete the remaining pending items required for Cognity V1 to be beta-ready.

## Requirements

### R1 — Activation goal wired into AI prompt
The AI system prompt must load the org's configured activation goal from the database and include it in the prompt context so Cognity knows what success looks like for each customer and can guide users toward it.

**Acceptance criteria:**
- `generateAIResponse` queries `activation_goals` for the org before building the prompt
- The goal's `event_name` and `description` are injected into the system prompt
- If no goal is configured, the prompt gracefully falls back to generic guidance

### R2 — Dashboard auth routes wired up
The Next.js dashboard must have working sign-in and sign-up pages powered by Clerk, and a middleware that protects all `/dashboard/*` routes from unauthenticated access.

**Acceptance criteria:**
- `/auth/sign-in` renders the Clerk `<SignIn>` component
- `/auth/sign-up` renders the Clerk `<SignUp>` component
- `middleware.ts` at the app root uses Clerk's `authMiddleware` / `clerkMiddleware` to redirect unauthenticated users away from `/dashboard/*` to `/auth/sign-in`
- Authenticated users visiting `/auth/sign-in` or `/auth/sign-up` are redirected to `/dashboard`

### R3 — Dashboard navigation shell
There is currently no persistent navigation around dashboard pages. The dashboard needs a layout with a sidebar/top nav so users can move between Analytics, Documentation, and Activation Goal sections without getting lost.

**Acceptance criteria:**
- A shared `dashboard/layout.tsx` wraps all dashboard sub-pages
- Navigation links to `/dashboard`, `/dashboard/analytics`, `/dashboard/docs`, `/dashboard/goals`
- Active route is visually indicated
- User info and a sign-out button are accessible from the nav

### R4 — Org provisioning (API key page)
There is no way for a SaaS founder to get their API key from the dashboard. An Install/API Key page must show the org's API key with a copy button and the SDK install snippet.

**Acceptance criteria:**
- A new `/dashboard/install` page exists
- It fetches and displays the org's API key (masked by default, reveal on click)
- It shows the ready-to-paste SDK `<script>` snippet with the key pre-filled
- Navigation item added for Install page

### R5 — Nudge message uses AI context
The stuck-user nudge is currently a hardcoded static string. It should be a short AI-generated message that references the session's current goal, making it contextually relevant.

**Acceptance criteria:**
- `detectStuck` (or a replacement function) accepts `sessionId` so it can load the session's `goal_text`
- Nudge message is generated via Gemini, referencing what the user was trying to do
- Falls back to the existing static message if goal is unavailable or AI call fails
- Response time stays under 3 seconds (use a short, fast prompt)
