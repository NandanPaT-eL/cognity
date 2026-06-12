# Cognity UI — File Placement Guide

## V1 Feature Checklist ✅

All 6 V1 tasks are complete per `.kiro/specs/v1-completion/tasks.md`:
- ✅ Task 1: Activation goal wired into AI prompt
- ✅ Task 2: Clerk auth middleware  
- ✅ Task 3: Sign-in and sign-up pages
- ✅ Task 4: Dashboard navigation layout
- ✅ Task 5: Org API key + Install page
- ✅ Task 6: AI-generated contextual idle nudge

---

## File Placement

| File in this folder              | Replace/create at                                               |
|----------------------------------|-----------------------------------------------------------------|
| `globals.css`                    | `apps/dashboard/app/globals.css`                               |
| `cognity-components.css`         | `apps/dashboard/app/cognity-components.css` (new — see note)   |
| `tailwind.config.ts`             | `apps/dashboard/tailwind.config.ts`                            |
| `dashboard-layout.tsx`           | `apps/dashboard/app/dashboard/layout.tsx`                      |
| `dashboard-page.tsx`             | `apps/dashboard/app/dashboard/page.tsx`                        |
| `analytics-page.tsx`             | `apps/dashboard/app/dashboard/analytics/page.tsx`              |
| `docs-page.tsx`                  | `apps/dashboard/app/dashboard/docs/page.tsx`                   |
| `goals-page.tsx`                 | `apps/dashboard/app/dashboard/goals/page.tsx`                  |
| `install-page.tsx`               | `apps/dashboard/app/dashboard/install/page.tsx`                |
| `auth-pages-reference.txt`       | Read this — contains both auth page component code            |
| `widget-css.ts`                  | Paste the `WIDGET_CSS` string into `packages/sdk/src/widget.ts`|

---

## Step-by-step

### 1. Import the component CSS
In `apps/dashboard/app/globals.css`, add one line after the Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './cognity-components.css';   /* ← add this */
```

Then paste the contents of `cognity-components.css` into that new file.

### 2. Add Inter font to layout
In `apps/dashboard/app/layout.tsx`, add the Google Fonts link in `<head>`:

```tsx
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata = { title: 'Cognity', description: 'AI Onboarding Assistant' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### 3. Update the SDK widget
Open `packages/sdk/src/widget.ts`.
Find the `const WIDGET_CSS = \`...\`` string and replace the entire contents 
between the backticks with the CSS from `widget-css.ts`.

Also update the panel's innerHTML to add the header-dot and split the header:

```ts
panel.innerHTML = `
  <div id="cognity-header">
    <div id="cognity-header-text">
      <h3>Cognity</h3>
      <p>Your onboarding assistant</p>
    </div>
    <div id="cognity-header-dot"></div>
  </div>
  <div id="cognity-messages"></div>
  <div id="cognity-input-area">
    <input id="cognity-input" placeholder="Type a message…" />
    <button id="cognity-send">
      <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
    </button>
  </div>`
```

### 4. Auth pages
See `auth-pages-reference.txt` — it contains the full TSX for both:
- `apps/dashboard/app/auth/sign-in/[[...sign-in]]/page.tsx`
- `apps/dashboard/app/auth/sign-up/[[...sign-up]]/page.tsx`

---

## Design System

Three colours, nothing else:

| Token    | Hex       | Used for                              |
|----------|-----------|---------------------------------------|
| `--ink`  | `#0D0D0D` | Text, sidebar background, code blocks |
| `--lead` | `#2563EB` | Buttons, active nav, focus rings, charts, widget bubble |
| `--paper`| `#F7F7F5` | App background, input backgrounds     |

Tailwind: use `text-ink`, `bg-lead`, `bg-paper`, etc. directly in className.