## Architecture

### App Router

Next.js 16 App Router. All routes under `src/app/`. Bottom-nav mobile shell — no sidebar.

### Root layout (`src/app/layout.tsx`)

1. Loads `Hanken_Grotesk` (weights 400/500/600/700/800) and `JetBrains_Mono` via `next/font/google`
2. Sets CSS variables `--font-hanken` and `--font-jetbrains` on `<html>`
3. Wraps body in `<StoreProvider>` (global state)
4. `<main>` is `flex-1 overflow-y-auto pb-16` — leaves room for fixed bottom nav
5. `<BottomNav />` is fixed at bottom, z-50

### Route → screen mapping

| Route | Screen | File |
|---|---|---|
| `/` | redirect | `src/app/page.tsx` |
| `/today` | Home / Today | `src/app/today/page.tsx` |
| `/words` | Library | `src/app/words/page.tsx` |
| `/phrases` | Phrase collections | `src/app/phrases/page.tsx` |
| `/practice` | Practice hub + session | `src/app/practice/page.tsx` |
| `/profile` | User profile | `src/app/profile/page.tsx` |

### Client vs Server

Every page that reads from `useStore()` must be `"use client"`. Currently all 5 pages are client components because they read/write state. If a page is purely static display, it can be a Server Component.

### Page padding convention

All pages use `style={{ padding: "60px 18px 24px" }}` as the outer wrapper — 60px top clears the status bar area, 18px sides, 24px bottom above the nav.

### Bottom nav

`src/app/components/BottomNav.tsx` — `"use client"`, uses `usePathname()`. Five tabs with `lucide-react` icons. Active tab styled via `.vk-tab.is-on` CSS class.
