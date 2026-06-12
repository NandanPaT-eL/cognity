# V1 Completion — Tasks

## Task 1: Wire activation goal into AI prompt
- [x] 1.1 In `apps/api/src/services/ai.ts`, import `activationGoals` from the db schema
- [x] 1.2 Query `activationGoals` by `org_id` before building the system prompt
- [x] 1.3 Inject `event_name` and `description` into the system prompt when a goal exists
- [x] 1.4 Verify the fallback when no goal is configured still produces a valid prompt

## Task 2: Add Clerk auth middleware
- [x] 2.1 Create `apps/dashboard/middleware.ts` using `clerkMiddleware` + `createRouteMatcher` to protect `/dashboard/(.*)` routes
- [x] 2.2 Redirect unauthenticated users to `/auth/sign-in`

## Task 3: Add sign-in and sign-up pages
- [x] 3.1 Create `apps/dashboard/app/auth/sign-in/[[...sign-in]]/page.tsx` with Clerk `<SignIn>` component
- [x] 3.2 Create `apps/dashboard/app/auth/sign-up/[[...sign-up]]/page.tsx` with Clerk `<SignUp>` component

## Task 4: Add dashboard navigation layout
- [x] 4.1 Create `apps/dashboard/app/dashboard/layout.tsx` as a client component with sidebar nav
- [x] 4.2 Include nav links: Dashboard, Analytics, Documentation, Activation Goal, Install
- [x] 4.3 Highlight the active route using `usePathname()`
- [x] 4.4 Include `<UserButton>` from Clerk at the bottom of the sidebar

## Task 5: Add org API key / Install page
- [x] 5.1 Create `apps/api/src/routes/org.ts` with `GET /v1/org/me` returning `{ id, name, api_key }`
- [x] 5.2 Register the org route in `apps/api/src/index.ts`
- [x] 5.3 Create `apps/dashboard/app/dashboard/install/page.tsx` that fetches and displays the API key
- [x] 5.4 Add masked key display with reveal toggle and copy-to-clipboard
- [x] 5.5 Render the ready-to-paste SDK script snippet with the key pre-filled

## Task 6: AI-generated contextual nudge
- [x] 6.1 Update `apps/api/src/services/idle.ts` to accept `goalText?: string` parameter
- [x] 6.2 When goal text is present, call Gemini to generate a contextual nudge sentence
- [x] 6.3 Wrap the Gemini call in try/catch and fall back to static message on failure
- [x] 6.4 Update `apps/api/src/routes/events.ts` to load session `goal_text` and pass it to `detectStuck`
