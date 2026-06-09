## Component Patterns

### Props type

Named type above the component, always:

```tsx
type WordCardProps = { word: Word; onClick: () => void; index?: number }

export default function WordCard({ word, onClick, index = 0 }: WordCardProps) { ... }
```

### Shared primitives

| Component | Purpose | Key props |
|---|---|---|
| `Avatar` | Initials with hashed hue background | `name: string`, `size?: number` |
| `BoxMeter` | 5-dot memory box indicator | `box: number` (1–5), `size?: number` |
| `WordCard` | Word list row | `word: Word`, `onClick: () => void`, `index?: number` |
| `FlipCard` | 3D flip card (word ↔ meaning) | `word: Word`, `height?: number` |
| `StreakCard` | SVG ring + flame + streak count | `streak: number`, `addedToday: number`, `goal: number` |
| `Sheet` | Bottom sheet overlay | `open: boolean`, `onClose: () => void`, `title?: string` |
| `SectionHead` | Section title + optional action link | `title: string`, `action?: string`, `onAction?: () => void` |

### Sheet pattern

Sheet is a fixed overlay — render it anywhere in the component tree, `open` controls visibility:

```tsx
<Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add a word">
  <WordForm onCancel={() => setAddOpen(false)} onSave={handleSave} />
</Sheet>
```

Never use `dialog` or `modal` — use `Sheet`.

### FlipCard

`"use client"` — has internal `useState(flipped)`. Resets on `word.id` change via `useEffect`. Click anywhere to flip. `height` prop controls the fixed height (default 300).

### Avatar

Computes a deterministic hue from the name string (hash mod 360). Background: `oklch(0.90 0.045 ${h})`, text: `oklch(0.40 0.07 ${h})`. No image support — always initials.

### WordCard

Shows word + POS + due dot on the left; BoxMeter + relative date on the right. Click calls `onClick`. Apply `vk-rise` + `animationDelay` for staggered list animation.

### Page structure template

```tsx
"use client"
import { useStore } from "../store/StoreContext"

export default function ExamplePage() {
  const store = useStore()
  return (
    <div style={{ padding: "60px 18px 24px" }}>
      <div className="vk-col" style={{ gap: 22 }}>
        {/* header */}
        <div className="vk-between" style={{ alignItems: "flex-start" }}>
          <div className="vk-col" style={{ gap: 3 }}>
            <span className="vk-eyebrow">subtitle</span>
            <h1 className="vk-display">Title</h1>
          </div>
        </div>
        {/* content */}
      </div>
    </div>
  )
}
```
