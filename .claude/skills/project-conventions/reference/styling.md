## Styling — vk-* Design System

### Design tokens (CSS vars in `:root`)

| Token | Value | Use |
|---|---|---|
| `--bg` | `oklch(0.969 0.008 140)` | page background |
| `--surface` | `oklch(0.998 0.003 140)` | card / input background |
| `--surface-2` | `oklch(0.958 0.009 145)` | subtle surface, hover states |
| `--ink` | `oklch(0.27 0.016 158)` | primary text |
| `--ink-soft` | `oklch(0.49 0.013 158)` | secondary text |
| `--ink-faint` | `oklch(0.66 0.010 158)` | disabled / placeholder |
| `--accent` | `oklch(0.60 0.075 155)` | sage green — primary action |
| `--accent-ink` | computed | text on accent-tint surface |
| `--accent-tint` | computed | light accent background |
| `--accent-soft` | computed | soft accent background |
| `--line` | `oklch(0.915 0.010 150)` | borders |
| `--line-soft` | `oklch(0.945 0.008 150)` | subtle dividers |
| `--clay` | `oklch(0.74 0.085 62)` | warm amber — streaks |
| `--clay-soft` | computed | light clay background |
| `--r-card` | `20px` | card border radius |
| `--r-md` | `14px` | medium radius |
| `--r-pill` | `999px` | pill / chip radius |
| `--sh-1/2/3` | computed | box shadow levels |
| `--ff` | Hanken Grotesk | body font |
| `--mono` | JetBrains Mono | eyebrow / monospace |

### Typography classes

| Class | Size | Weight | Use |
|---|---|---|---|
| `.vk-display` | 30px | 800 | Page title (`<h1>`) |
| `.vk-h1` | 23px | 700 | Section heading |
| `.vk-h2` | 18px | 700 | Sub-heading |
| `.vk-h3` | 15px | 700 | Card title |
| `.vk-body` | 15px | 400 | Body copy |
| `.vk-sm` | 13px | 500 | Secondary text |
| `.vk-xs` | 11.5px | 600 | Tiny labels |
| `.vk-eyebrow` | 10.5px | 500 | Uppercase mono label |
| `.vk-muted` | — | — | `color: var(--ink-soft)` |
| `.vk-faint` | — | — | `color: var(--ink-faint)` |
| `.vk-accent` | — | — | `color: var(--accent-ink)` |

### Surface classes

```css
.vk-card      /* surface + border + shadow */
.vk-card-flat /* surface + border, no shadow */
```

### Button classes

```
.vk-btn            /* base — always combine with variant */
.vk-btn-primary    /* accent fill */
.vk-btn-soft       /* accent-soft fill */
.vk-btn-ghost      /* surface-2 fill */
.vk-btn-line       /* surface + border */
.vk-btn-block      /* width: 100% */
.vk-btn-lg         /* larger padding */
.vk-btn-sm         /* smaller padding */
```

### Other utility classes

```
.vk-chip / .vk-chip.is-on   filter pills
.vk-tag / .vk-tag-clay      small badges
.vk-input / .vk-textarea    form inputs
.vk-label                   form label
.vk-bar > span              progress bar
.vk-row                     flex row
.vk-col                     flex column
.vk-between                 flex space-between
.vk-wrap                    flex-wrap
.vk-pressable               hover/active interaction
.vk-rise                    entrance animation
.vk-pop                     pop animation
.vk-flip / .is-flipped      3D card flip
```

### Tailwind usage

Use Tailwind **only** for layout/spacing: `flex`, `gap-*`, `px-*`, `py-*`, `grid`, `grid-cols-*`, `overflow-*`, `z-*`, `fixed`, `sticky`. Never use Tailwind for color or typography — use `vk-*` classes.

### Inline styles

Allowed only for: dynamic computed values (avatar hue, SVG circle math, animation delay offsets), complex grid layouts with variable columns, Recharts.
