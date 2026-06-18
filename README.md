# Cognity UI — Drop-in File Replacements

## What changed and why

The goal was to move from a "vibe-coded" look (generic Tailwind defaults,
flat surfaces, no depth, no typographic intention) toward something that
reads as deliberate: proper letter-spacing, layered shadows, restrained
colour use, and copy that sounds like a real product rather than a template.

Inspired by Jimo's approach: cinematic dark sections, clean light sections,
large confident type, minimal chrome in the dashboard sidebar.

---

## File placement table

| File in this folder              | Replace at                                                            |
|----------------------------------|-----------------------------------------------------------------------|
| `globals.css`                    | `apps/dashboard/app/globals.css`                                      |
| `tailwind.config.ts`             | `apps/dashboard/tailwind.config.ts`                                   |
| `layout.tsx`                     | `apps/dashboard/app/layout.tsx`                                       |
| `page.tsx`                       | `apps/dashboard/app/page.tsx`  (landing page)                         |
| `dashboard-layout.tsx`           | `apps/dashboard/app/dashboard/layout.tsx`                             |
| `dashboard-page.tsx`             | `apps/dashboard/app/dashboard/page.tsx`                               |
| `auth-sign-in-page.tsx`          | `apps/dashboard/app/auth/sign-in/[[...sign-in]]/page.tsx`             |
| `auth-sign-up-page.tsx`          | `apps/dashboard/app/auth/sign-up/[[...sign-up]]/page.tsx`             |

**Not touched:** analytics, docs, goals, install pages — the business logic
in those is correct and they already pick up the improved `globals.css`
tokens (`cog-input`, `cog-btn-primary`, `cog-card`, etc.) automatically.

---

## Design decisions

### Palette (unchanged from your existing system — refined tokens only)
| Role   | Hex       | Tailwind class      |
|--------|-----------|---------------------|
| Void   | `#09090B` | `text-void`, `bg-void` |
| Chalk  | `#FAFAF9` | `bg-chalk`, `text-chalk` |
| Signal | `#2563EB` | `text-signal`, `bg-signal` |

The old `ink / lead / paper` aliases still work — they now point to the
same RGB values via the new tailwind config.

### Typography
- Negative letter-spacing on all headings (`tracking-[-0.025em]` to
  `tracking-[-0.034em]` depending on size) — this is what separates
  considered type from defaults.
- Body uses `Inter` optical size 14–32, weight 400/500/600/700.
- Line heights tightened on large type, slightly relaxed on body copy.

### Depth system
Five shadow steps (`xs` → `xl`) replacing the old two. Cards lift on hover
with both shadow increase and a 2px translateY — same pattern Jimo uses.

### Dark sections
The hero, "How it works", and final CTA use `--void` background with a
subtle radial blue glow at the top — gives depth without requiring a
gradient library.

### What makes it "not vibe coded"
1. No random `rounded-2xl` everywhere — radius is intentional per element
2. No `font-bold` on body text — weight is used deliberately
3. No `shadow-xl` on every card — shadow scale matches visual importance
4. Letter-spacing goes negative on headings (browsers default to 0)
5. Colours never stray from the 3-token system
6. Copy is specific and functional ("45 seconds without activity", not
   "real-time smart detection") — words are design material

---

## After replacing files

```bash
cd apps/dashboard
npm run dev
```

TypeScript will be happy — all existing component imports and logic are
preserved. The new files only change presentation, not data flow.