## State Management

### StoreContext

Single context in `src/app/store/StoreContext.tsx`. Wraps entire app via `<StoreProvider>` in `layout.tsx`.

### useStore hook

```tsx
"use client"
import { useStore } from "../store/StoreContext"

export default function MyPage() {
  const store = useStore()
  // store.words, store.categories, store.stats, store.plan ...
}
```

`useStore()` throws if called outside `<StoreProvider>` — always inside a page or component within the layout.

### Store shape

```ts
type StoreValue = {
  // Data
  words: Word[]
  categories: Category[]
  TODAY: string              // "YYYY-MM-DD"
  STREAK: number
  GOAL: number               // daily word goal
  wordOfDay: Word
  plan: "free" | "pro"

  // Derived (computed via useMemo)
  stats: {
    total: number
    mastered: number         // box >= 5
    due: number              // w.due === true
    addedToday: number       // added === TODAY
  }
  phraseStats: {
    collections: number
    sentences: number
  }
  suggestions: SuggestedCat[]

  // Mutations
  setPlan: (p: "free" | "pro") => void
  addWord: (data: { word: string; pos: string; meaning: string; note: string }) => Word
  updateWord: (id: string, data: Partial<Word>) => void
  deleteWord: (id: string) => void
  markReview: (id: string, correct: boolean) => void
}
```

### Data types (exported from StoreContext)

```ts
type Word = {
  id: string; word: string; pos: string; meaning: string; note: string
  added: string; box: number; seen: number; due: boolean
}
type Sentence  = { id: string; text: string; meaning: string; note: string }
type Category  = { id: string; name: string; icon: string; hue: number; sentences: Sentence[] }
```

Import from `"../store/StoreContext"` (or `"../../store/StoreContext"` for nested components).

### markReview

Updates `box` (clamp 1–5: +1 if correct, -1 if wrong), increments `seen`, recomputes `due` (`box <= 2`).

### Persistence

Currently in-memory only — state resets on page reload. When connecting to API, replace `useState(INITIAL_WORDS)` with an API fetch inside `StoreProvider`.

### SUGGESTED_CATS

Exported as a named export from `StoreContext.tsx`. Import directly:

```ts
import { SUGGESTED_CATS } from "../store/StoreContext"
```
