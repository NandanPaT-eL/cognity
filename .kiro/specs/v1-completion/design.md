# V1 Completion — Design

## R1: Activation goal in AI prompt

**File to change:** `apps/api/src/services/ai.ts`

`generateAIResponse` already receives `orgId`. Before building the system prompt, run a single `db.query.activationGoals.findFirst` filtered by `org_id`. Inject the result into the prompt between the user goal and documentation context sections:

```
Activation goal for this product: <event_name> — <description>
```

If no goal is found, omit that line entirely.

---

## R2: Dashboard auth routes + middleware

**New files:**
- `apps/dashboard/app/auth/sign-in/[[...sign-in]]/page.tsx` — renders `<SignIn>` with `afterSignInUrl="/dashboard"`
- `apps/dashboard/app/auth/sign-up/[[...sign-up]]/page.tsx` — renders `<SignUp>` with `afterSignUpUrl="/dashboard"`
- `apps/dashboard/middleware.ts` — uses Clerk's `clerkMiddleware` with `createRouteMatcher` to protect `/dashboard/(.*)` routes

Clerk v5 (`@clerk/nextjs@^5`) uses `clerkMiddleware` + `createRouteMatcher` pattern (not the deprecated `authMiddleware`).

---

## R3: Dashboard navigation shell

**New file:** `apps/dashboard/app/dashboard/layout.tsx`

Renders a two-column layout: fixed left sidebar + main content area. The sidebar contains:
- Cognity logo/wordmark
- Nav links: Dashboard, Analytics, Docs, Activation Goal, Install
- Bottom section: `<UserButton>` from `@clerk/nextjs` + org name

Uses `usePathname()` from `next/navigation` to highlight the active route. This is a client component (`"use client"`).

---

## R4: Org API key / Install page

**New files:**
- `apps/dashboard/app/dashboard/install/page.tsx`
- New API route: `apps/api/src/routes/org.ts` — `GET /v1/org/me` returns `{ api_key, name }` authenticated via Clerk JWT

The install page:
1. Fetches `GET /v1/org/me` with the Clerk token
2. Shows the API key masked (`sk-••••••••`) with a toggle to reveal
3. Shows a copy-to-clipboard button
4. Renders the ready-to-paste script tag

The API route must be registered in `apps/api/src/index.ts`.

---

## R5: AI-generated nudge

**File to change:** `apps/api/src/services/idle.ts`

Update `detectStuck` signature to accept `goalText?: string`. When `idleSeconds >= 45` and `goalText` is present, call Gemini with a short prompt:

```
The user is trying to: <goalText>
They have been idle on the page "<pageLabel>" for 45 seconds.
Write one short, friendly sentence offering help. Max 20 words.
```

Use `geminiChat.generateContent` (not streaming — this is a single short call). Wrap in try/catch and fall back to the existing static string on any error.

**File to change:** `apps/api/src/routes/events.ts`

When `event_type === 'idle'`, load the session's `goal_text` before calling `detectStuck`, then pass it in.
