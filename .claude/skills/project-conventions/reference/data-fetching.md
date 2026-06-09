## Data Fetching

### Current state

All data is static mock data in `StoreContext.tsx` (`INITIAL_WORDS`, `INITIAL_CATEGORIES`). No API calls yet.

### Connecting to vokrub-api (customer routes)

Base URL: `process.env.NEXT_PUBLIC_API_URL` (`.env.local`).

When integrating, replace the `useState(INITIAL_WORDS)` in `StoreProvider` with a data fetch on mount:

```tsx
// inside StoreProvider
const [words, setWords] = useState<Word[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/word`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
    .then(r => r.json())
    .then(data => { setWords(data); setLoading(false) })
}, [])
```

### Auth token

Customer auth token from `POST /api/auth/login`. Store in `localStorage`. Pass as `Authorization: Bearer <token>`.

### API endpoints (vokrub-api)

| Action | Method | Path |
|---|---|---|
| Login | POST | `/api/auth/login` |
| Current user | GET | `/api/auth/me` |
| List customers | GET | `/api/customer` |

Word-specific endpoints do not exist yet in vokrub-api — they need to be added when this integration happens.

### Optimistic updates

For mutations (add/delete word), update local state immediately and fire the API call in background. On error, roll back.

```tsx
const addWord = useCallback((data) => {
  const w = { id: `tmp-${Date.now()}`, ...data, added: TODAY, box: 1, seen: 0, due: true }
  setWords(prev => [w, ...prev])
  fetch(`${API}/api/word`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  }).then(r => r.json()).then(saved => {
    setWords(prev => prev.map(x => x.id === w.id ? { ...x, id: saved.id } : x))
  })
  return w
}, [])
```
