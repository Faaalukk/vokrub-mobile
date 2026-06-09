## Read this first — Project skill

Before doing any non-trivial work in this repo, read the project skill index at `.claude/skills/project-conventions/SKILL.md` and then load the relevant topic file under `.claude/skills/project-conventions/reference/`. The skill is the canonical convention set for this codebase (one H2 topic per reference file): architecture, directory structure, component patterns, design system, state management, data fetching.

Pull from it rather than inventing a parallel pattern.

## Commands

Package manager is **npm**.

```bash
npm install        # install deps
npm run dev        # Next.js dev server on :8081
npm run build      # production build
npm run start      # serve production build
npm run lint       # eslint
```

## Architecture

This is the **customer-facing vocabulary app** for Vokrub — users store words, practice flashcards, manage phrase collections. It is a Next.js 16 App Router application with TypeScript, Tailwind CSS v4, and a custom `vk-*` design system (warm sage paper theme, light mode).

### Layout

`src/app/layout.tsx` — root layout. Loads Hanken Grotesk + JetBrains Mono via `next/font/google`. Wraps children in `<StoreProvider>`. Bottom navigation via fixed `<BottomNav />`. Content scrolls in `<main>` between nav and screen top.

### Routing

```
/          → redirect to /today
/today     — home screen: greeting, streak, word of day, recent words
/words     — word library: search, filter, list
/phrases   — phrase collections + suggested
/practice  — practice mode hub + flashcard session
/profile   — user stats, subscription, settings
```

### State (StoreContext)

Global in-memory state via `src/app/store/StoreContext.tsx`. Provides: words, categories, streak, plan, CRUD methods. Access with `useStore()` hook — only works inside `<StoreProvider>`. All interactive pages are `"use client"` and call `useStore()`.

### Design system

`vk-*` CSS classes defined in `globals.css`. Warm sage palette (light theme). Tokens: `--bg`, `--surface`, `--surface-2`, `--ink`, `--ink-soft`, `--ink-faint`, `--accent`, `--line`, `--clay`. Fonts: Hanken Grotesk (`--ff`) + JetBrains Mono (`--mono`).

Components from `src/app/components/` implement the design system — see `component-patterns.md`.

## Naming

- Components: `PascalCase.tsx`
- Pages: `page.tsx` (Next.js convention)
- Route dirs: single word (`today`, `words`, `phrases`, `practice`, `profile`)
- Store: `StoreContext.tsx` (single context file)
- Types exported from `StoreContext.tsx`: `Word`, `Sentence`, `Category`

## When in doubt

Consult `.claude/skills/project-conventions/reference/`. Quick map:

- Adding a screen → `directory-structure.md` + `component-patterns.md`
- Design system classes → `styling.md`
- State (add/update/delete words) → `state-management.md`
- API integration → `data-fetching.md`
- Sheet / overlay → `component-patterns.md`
