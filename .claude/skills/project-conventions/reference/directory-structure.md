## Directory Structure

```
vokrub-mobile/
├── src/app/
│   ├── layout.tsx                  # root layout — StoreProvider + BottomNav
│   ├── globals.css                 # vk-* design system + Tailwind
│   ├── page.tsx                    # redirect → /today
│   ├── store/
│   │   └── StoreContext.tsx        # global state + SUGGESTED_CATS export
│   ├── components/                 # shared primitive components
│   │   ├── BottomNav.tsx
│   │   ├── Avatar.tsx
│   │   ├── BoxMeter.tsx
│   │   ├── WordCard.tsx
│   │   ├── FlipCard.tsx
│   │   ├── StreakCard.tsx
│   │   ├── Sheet.tsx
│   │   └── SectionHead.tsx
│   ├── today/
│   │   ├── page.tsx
│   │   ├── WordForm.tsx            # add/edit word sheet body
│   │   └── WordDetail.tsx          # word detail sheet
│   ├── words/
│   │   └── page.tsx
│   ├── phrases/
│   │   └── page.tsx
│   ├── practice/
│   │   └── page.tsx
│   └── profile/
│       └── page.tsx
└── public/
    └── fonts/
        ├── LINESeedSansTH_W_Rg.woff2
        └── LINESeedSansTH_W_Bd.woff2
```

### Where to put new files

- New shared primitive (used by 2+ pages) → `src/app/components/`
- New screen-specific component → co-locate in `src/app/<route>/NameOfComponent.tsx`
- New route → `src/app/<route>/page.tsx` + add tab to `BottomNav.tsx`
- New data type → export from `src/app/store/StoreContext.tsx`
