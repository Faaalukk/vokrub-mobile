---
name: project-conventions
description: Canonical conventions for vokrub-mobile — Next.js 16 App Router customer vocabulary app. Load the relevant reference file before writing any page, component, or state code.
metadata:
  type: project
---

# vokrub-mobile — Project Conventions Index

Stack: **Next.js 16.2 · React 19 · TypeScript 5 · Tailwind CSS v4 · vk-* design system · lucide-react**

This is the **customer vocabulary app** — users store words, practice, manage phrases. Warm sage light theme, mobile-first layout, bottom navigation.

## Reference files

Load from `.claude/skills/project-conventions/reference/`:

| Topic | File | When to load |
|---|---|---|
| App Router layout & routing | `architecture.md` | Any routing or layout change |
| File & directory placement | `directory-structure.md` | Adding any new file |
| Component anatomy & props | `component-patterns.md` | Writing any component |
| vk-* design system & tokens | `styling.md` | Styling anything |
| StoreContext / state | `state-management.md` | Reading or mutating app state |
| API integration | `data-fetching.md` | Connecting to vokrub-api |

## Quick rules (always active)

- All interactive pages: `"use client"` + `useStore()`.
- Static-display-only pages: Server Component (no directive, no store).
- `vk-*` CSS classes for all UI — do not invent new CSS classes.
- Use Tailwind only for layout/spacing (`flex`, `gap-*`, `px-*`) — never for color or typography (use `vk-*`).
- Inline styles only for: dynamic computed values (avatar hue, SVG progress), animation delays.
- Icons from `lucide-react` only.
- No `recharts` or other chart lib in mobile — keep it simple.
- TypeScript strict — no `any`, explicit prop types on every component.
- Bottom nav tabs: Today, Words, Phrases, Practice, Profile — do not add more without updating `BottomNav.tsx`.
