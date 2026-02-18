# HypnoScript — Architecture Handover Blueprint

> **Audience**: Visual UI agent / next developer.
> This document is the authoritative map of every endpoint, data structure, and frontend component in the initial scaffold. Read this before touching any file.

---

## Project Layout

```
hypno-saas/
├── backend/                  Node.js / Express 5 API
│   ├── src/
│   │   ├── app.js            Entry point — mounts all routes
│   │   ├── middleware/
│   │   │   ├── auth.js       JWT Bearer verification → req.user
│   │   │   └── error.js      404 + global error handler
│   │   ├── models/
│   │   │   └── store.js      In-memory DB (swap for Postgres/SQLite)
│   │   ├── services/
│   │   │   └── scriptGenerator.js   LLM abstraction layer
│   │   └── routes/
│   │       ├── auth.js       /api/auth/*
│   │       └── scripts.js    /api/scripts/*
│   ├── .env.example
│   └── package.json
│
├── frontend/                 Vite + React 18 + Tailwind v3
│   ├── src/
│   │   ├── main.jsx          React root
│   │   ├── App.jsx           Router + AuthProvider wrapper
│   │   ├── index.css         Tailwind base + component classes
│   │   ├── lib/
│   │   │   └── api.js        Fetch client (auth + scripts)
│   │   ├── hooks/
│   │   │   └── useAuth.js    AuthContext provider + hook
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SymptomForm.jsx
│   │   │   └── ScriptViewer.jsx
│   │   └── pages/
│   │       ├── Landing.jsx
│   │       ├── AuthPage.jsx
│   │       └── Dashboard.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js        Dev proxy: /api → localhost:4000
│   └── package.json
│
└── handover.md               ← you are here
```

---

## Backend

### Environment Variables (`backend/.env`)
| Variable | Required | Default | Notes |
|---|---|---|---|
| `PORT` | no | 4000 | API listen port |
| `JWT_SECRET` | **yes** | — | Any long random string |
| `JWT_EXPIRES_IN` | no | `7d` | Standard JWT duration string |
| `AI_PROVIDER` | no | `stub` | `stub` \| `openai` \| `anthropic` |
| `OPENAI_API_KEY` | if openai | — | |
| `ANTHROPIC_API_KEY` | if anthropic | — | |
| `FRONTEND_URL` | no | `http://localhost:5173` | CORS origin |

---

### API Endpoints

All endpoints are prefixed `/api`.

#### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | none | Returns `{ status: "ok", timestamp }` |

#### Auth — `/api/auth`

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/auth/register` | none | `{ email, password }` | `{ token, user }` |
| POST | `/auth/login` | none | `{ email, password }` | `{ token, user }` |
| GET | `/auth/me` | Bearer | — | `User` |
| POST | `/auth/logout` | Bearer | — | `{ message }` |

#### Scripts — `/api/scripts`

All routes require `Authorization: Bearer <token>`.

| Method | Path | Body / Params | Response |
|---|---|---|---|
| POST | `/scripts/generate` | See **GenerateRequest** below | `Script` |
| GET | `/scripts` | — | `{ scripts: Script[], total }` |
| GET | `/scripts/:id` | path: UUID | `Script` |
| DELETE | `/scripts/:id` | path: UUID | `{ message }` |

---

### Data Structures

#### User
```ts
{
  id: string;          // UUID v4
  email: string;
  createdAt: string;   // ISO 8601
}
```

#### GenerateRequest (POST /scripts/generate body)
```ts
{
  symptoms: string[];        // required, min 1 item
  tone?: "calm"              // default "calm"
       | "authoritative"
       | "compassionate"
       | "energising";
  duration?: number;         // minutes, 5–60, default 20
  title?: string;            // auto-generated if omitted
}
```

#### Script
```ts
{
  id: string;           // UUID v4
  userId: string;
  title: string;
  symptoms: string[];
  tone: string;
  duration: number;
  content: string;      // Markdown-formatted hypnotherapy script
  createdAt: string;    // ISO 8601
  updatedAt: string;
}
```

#### Error response
```ts
{ error: string }
// or for validation failures:
{ errors: Array<{ msg, path, value }> }
```

---

### LLM Integration (`backend/src/services/scriptGenerator.js`)

- Export: `generateScript({ symptoms, tone, duration }) → Promise<string>`
- Current provider: `stub` — returns deterministic Markdown template
- To swap in a real model: set `AI_PROVIDER=openai` in `.env`, uncomment the OpenAI block, install `openai` package
- Function signature is provider-agnostic — no changes needed in `routes/scripts.js`

---

### Data Layer (`backend/src/models/store.js`)

Currently **in-memory** (lost on restart). To migrate to a real DB:

1. Replace `createUser` / `findUserByEmail` / `findUserById` with ORM calls
2. Replace `saveScript` / `listScripts` / `getScript` / `deleteScript` with ORM calls
3. No changes needed in routes — same function signatures

---

## Frontend

### Routing

| Path | Component | Guard |
|---|---|---|
| `/` | `Landing` | public |
| `/auth` | `AuthPage` | public only (redirects to `/dashboard` if logged in) |
| `/dashboard` | `Dashboard` | private (redirects to `/auth` if logged out) |

### Auth State

Managed by `useAuth` hook (React Context).

```ts
// useAuth() returns:
{
  user: User | null;
  loading: boolean;
  login(email, password): Promise<void>;
  register(email, password): Promise<void>;
  logout(): Promise<void>;
}
```

Token stored in `localStorage` under key `hs_token`.

---

### API Client (`frontend/src/lib/api.js`)

```ts
// Auth
auth.register(email, password)    → { token, user }
auth.login(email, password)       → { token, user }
auth.logout()                     → { message }
auth.me()                         → User

// Scripts
scripts.generate({ symptoms, tone, duration, title })  → Script
scripts.list()                                         → { scripts, total }
scripts.get(id)                                        → Script
scripts.delete(id)                                     → { message }
```

All calls automatically attach the Bearer token from localStorage. Throws `Error` with `.status` and `.data` on non-2xx responses.

---

### Components

#### `Header` (`src/components/Header.jsx`)
- **Props**: none (reads `useAuth` internally)
- **Renders**: Logo, sign in / get started links (logged out) OR email + sign out (logged in)
- **Design slot**: Replace with brand-specific nav design

#### `Sidebar` (`src/components/Sidebar.jsx`)
- **Props**:
  ```ts
  scripts: Script[]
  activeId: string | null
  onSelect: (script: Script) => void
  onDelete: (id: string) => void
  loading: boolean
  ```
- **Renders**: Script history list with symptom tags; hover-reveal delete button
- **Design slot**: Sidebar width is `w-64`; active item has `accent` left border

#### `SymptomForm` (`src/components/SymptomForm.jsx`)
- **Props**:
  ```ts
  onGenerate: (params: GenerateRequest) => Promise<void>
  generating: boolean
  ```
- **Internal state**: `symptoms[]`, `tone`, `duration`, `title`, text `input`
- **Renders**: Tag input, preset symptom chips, 4-option tone grid, duration slider, submit button
- **Design slot**: Main input form — primary candidate for visual overhaul

#### `ScriptViewer` (`src/components/ScriptViewer.jsx`)
- **Props**:
  ```ts
  script: Script | null
  loading: boolean
  ```
- **Renders**: 3 states — loading spinner, empty state, script content (Markdown via `react-markdown`)
- **Design slot**: Script typography, copy button placement

---

### Pages

#### `Landing` (`src/pages/Landing.jsx`)
- Static marketing page: hero + 3-feature grid
- CTA links to `/auth?mode=register`
- **Design slot**: Entire visual identity of the landing page

#### `AuthPage` (`src/pages/AuthPage.jsx`)
- Toggle between login / register modes via URL param `?mode=register`
- Inline error display
- **Design slot**: Auth card styling

#### `Dashboard` (`src/pages/Dashboard.jsx`)
- Composes: `Header` + `Sidebar` + `SymptomForm` + `ScriptViewer`
- State: `scriptList`, `activeScript`, `generating`, `loadingHistory`
- Loads script history on mount via `scriptsApi.list()`
- On generate: calls `scriptsApi.generate()`, prepends result to list, sets as active
- Mobile: `panel` state toggles between form and viewer

---

### Tailwind Design Tokens

```js
// tailwind.config.js custom colours
surface: '#0a0a0a'      // page background
panel:   '#111111'      // cards, sidebars
border:  '#1f1f1f'      // all borders
accent:  '#7c3aed'      // primary action (violet)
accent-light: '#a78bfa' // hover states, tags
```

Reusable utility classes (defined in `index.css`):
- `.btn-primary` — filled accent button
- `.btn-ghost` — transparent hover button
- `.input` — dark-mode form input
- `.card` — `panel` background with `border` border
- `.tag` — small pill label

---

## Running Locally

```bash
# Backend
cd backend
cp .env.example .env   # fill in JWT_SECRET at minimum
npm install
npm run dev            # http://localhost:4000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev            # http://localhost:5173
```

---

## What's Next (for the Visual UI Agent)

1. **Replace the stub LLM** — set `AI_PROVIDER=openai` and add `OPENAI_API_KEY` in `backend/.env`
2. **Persist data** — swap `backend/src/models/store.js` for SQLite (`better-sqlite3`) or Postgres (`pg` / Prisma)
3. **Visual redesign** — primary targets are `Landing.jsx`, `SymptomForm.jsx`, and `Dashboard.jsx`
4. **Add `@tailwindcss/typography`** for better `prose` rendering in `ScriptViewer`
5. **Stripe billing** — add a `POST /api/billing/checkout` route and gate `/scripts/generate` on subscription status
