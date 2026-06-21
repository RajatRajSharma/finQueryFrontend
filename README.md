# FinQuery — Frontend

> **Chat with company annual reports.** Upload a 10-K PDF, ask a question in plain English, and watch a short, **source-cited** answer type out live — taken straight from the document, not a guess.

This repo is the **web app** (the face). The brains + API live in a separate **`finQueryBackend`** repo and run live in production — this app talks to it over the internet. It's a **React + TypeScript + Vite** single-page app.

**🌐 Live app:** **https://finquery-frontend-virid.vercel.app** · **Backend it talks to:** https://finquerybackend.onrender.com (API docs: `/docs`)

---

## 1. The basic idea (in plain English)

The backend does the hard part — reading reports, finding the right passage, writing a grounded answer. This app is the part a human actually touches: a place to **drop in PDFs**, **ask questions**, and **see the answer with its sources**, plus a small dashboard showing **how good the answers are**.

Three screens, one job each:

| Route | Screen | What it does |
|---|---|---|
| `/` | **Home** | Public landing page — explains the product, links into the app |
| `/app` | **Chat** | Upload reports + ask questions (the core experience) |
| `/app/evaluation` | **Evaluation** | RAGAS quality scores, charts, and per-question table |

Everything you upload or ask is **wired to the live backend** — uploads hit `POST /upload`, questions stream over `POST /query/stream`, the dashboard reads `GET /evals`.

---

## 2. Try it (no setup)

**Just open the live app: https://finquery-frontend-virid.vercel.app** — it's already wired to the production backend, so you can upload a PDF and ask a question right away.

To run it locally instead:

```bash
npm install
npm run dev
```

Open the URL it prints — usually **http://localhost:5173/**. It points at the **production backend by default**, so uploading a PDF and asking a question works straight away.

> ⏳ **First question may be slow (~30–60s).** The backend runs on a free tier that sleeps when idle; the first call wakes it. The app pings it to keep it warm while open (see §6), but a cold start can still happen — just wait it out once.

---

## 3. How to use it (step by step)

1. **Open the app** and click through to **Chat** (`/app`).
2. **Upload a report.** Drag a `.pdf` 10-K onto the dropzone (or click it). The file shows a **spinner** while the backend ingests it (parse → chunk → embed → store), then a **✓** with a chunk count when it's ready. A **✕** means something went wrong (e.g. a scanned/image-only PDF with no selectable text) — hover for the reason.
   - You can upload **up to 3 reports** (see §7). Questions search across **all** ready reports, so you can compare companies in one ask.
3. **Ask a question** in plain English — *"What were Apple's total net sales?"*. Press **Enter** (Shift+Enter for a newline).
4. **Read the answer.** It **types out live** as the backend streams it, then **citation chips** appear underneath — each shows the source file + page and a relevance %. Click a chip to expand the exact snippet it came from.
5. **Start fresh** any time with **＋ New chat** (top-right of the chat). It clears the conversation but **keeps your uploaded reports**, so you don't re-upload.
6. **Check quality** on the **Evaluation** page (`/app/evaluation`) — RAGAS scores (faithfulness, relevancy, precision, recall) shown as cards, a bar chart, and a per-question table.

> 💾 Your conversation and uploaded-doc list are **cached in the browser for 1 week**, so leaving the page or reloading doesn't lose anything (see §6).

---

## 4. Install & scripts

**Requirements:** **Node.js 20+** (Vite 8 needs a modern Node) and **npm**. Check with `node -v`.

```bash
npm install       # install dependencies
npm run dev       # dev server with hot reload (http://localhost:5173)
npm run build     # type-check (tsc -b) + production build into dist/
npm run preview   # serve the production build locally
npm run lint      # run ESLint
```

### Configuration (`.env`)

Copy `.env.example` to `.env` and adjust. Every knob is optional — sensible defaults are baked in. All values are **build-time** (Vite inlines `VITE_*` vars).

| Var | Default | Meaning |
|---|---|---|
| `VITE_API_BASE_URL` | `https://finquerybackend.onrender.com` | main backend (upload / query / health) |
| `VITE_EVAL_API_BASE_URL` | `http://localhost:8000` | evaluation backend — kept separate (evals are slow + quota-heavy) |
| `VITE_KEEPALIVE_ENABLED` | `true` | ping `/health` to keep the free-tier backend awake |
| `VITE_KEEPALIVE_INTERVAL_MS` | `540000` (9 min) | how often to ping |
| `VITE_CHAT_CACHE_TTL_MS` | `604800000` (1 week) | how long chat + docs stay cached in the browser |

> The whole point: **change the server in one env var and the whole app follows** — every URL and endpoint lives in one place (`src/shared/constants/api.constant.ts`).

---

## 5. Tech stack

| Layer | Technology |
|---|---|
| UI library | **React 19** + **TypeScript** |
| Build / dev server | **Vite 8** |
| Routing | **React Router 7** (three routes) |
| Styling | Plain **CSS per component** + shared design tokens (CSS variables) — no UI framework |
| Server comms | native **`fetch`**; answers streamed over **SSE** (Server-Sent Events) |
| Persistence | **localStorage** (chat history + doc list, 1-week TTL) |
| Linting | **ESLint** + typescript-eslint |

---

## 6. Low-Level Design (how the UI is structured)

The app follows a **feature-first** architecture: everything about a domain — its components, types, and styles — lives in **one folder**, instead of being scattered across global `components/`, `hooks/`, `api/` folders. Three rules keep it clean:

1. **Pages are thin.** A page just imports features and arranges them — no business logic.
2. **Features expose a barrel.** Each feature publishes a clean public surface through its `index.ts`, so the rest of the app imports `from "@/features/chat"`, never deep paths.
3. **One source of truth for shared concerns.** All API URLs/endpoints and all tunable config live in `src/shared/constants/`. Change the server once, everywhere follows.

### 6.1 Layers (outer depends on inner, never the reverse)

```
pages/         thin route entry points — compose features, hold page state
   │
features/      the bulk of the app — one self-contained folder per domain
   │              (marketing · chat · documents · evaluation)
   │
shared/        cross-cutting NON-UI code (api client, hooks, constants, lib)
   │
styles/        the single source of truth for the visual system (tokens)
```

`components/ui/` sits alongside as the **design system**: generic visual primitives (e.g. `Logo`) that know nothing about FinQuery. A piece lives inside its feature until a *second* feature needs it, then it graduates here.

### 6.2 Folder map

```
src/
├── main.tsx                  # entry point — mounts <App/> inside the router
│
├── app/                      # app-wide wiring (the "shell")
│   ├── App.tsx               #   route table + global keep-alive hook
│   └── layout/AppHeader/     #   shared top bar for Chat + Evaluation
│
├── pages/                    # route entry points — thin, just compose features
│   ├── Home/                 #   assembles the marketing sections
│   ├── Chat/                 #   documents panel + chat area + the live wiring
│   └── Evaluation/           #   metric cards + chart + table
│
├── features/                 # one folder per domain (components + types + barrel)
│   ├── marketing/            #   landing-page sections (Hero, ValueCards, …)
│   ├── chat/                 #   ChatArea + Message/Citation types
│   ├── documents/            #   DocumentsPanel + DocItem type
│   └── evaluation/           #   MetricCards, MetricBarChart, QuestionsTable,
│                             #   FALLBACK_EVAL (bundled cached run)
│
├── components/ui/            # generic design-system primitives (e.g. Logo)
│
├── shared/                   # cross-cutting NON-UI code
│   ├── api/                  #   client.ts (all HTTP) + types.ts (wire shapes)
│   ├── constants/            #   api.constant.ts (URLs+endpoints) + config.constant.ts
│   ├── hooks/                #   useKeepAlive, usePersistentState
│   └── lib/                  #   generic helpers (e.g. newId())
│
├── styles/                   # tokens.css (colors/spacing/fonts) + base.css (reset)
└── assets/                   # images / gifs
```

### 6.3 The API client — one door to the backend

`src/shared/api/client.ts` is the **only** file that talks HTTP. Every other file imports a typed function from it. It knows two things and nothing leaks elsewhere:

- **Where the backend is** — `API_BASE_URL` / `EVAL_API_BASE_URL` from `constants/api.constant.ts`.
- **How to turn a failure into a useful error** — the backend returns `{"detail": "..."}` on 4xx/5xx; the client unwraps it into an `ApiError` carrying the HTTP status, so callers can branch (e.g. a 503 when Gemini/Qdrant is down).

| Function | Endpoint | Notes |
|---|---|---|
| `uploadPdf(file)` | `POST /upload` | multipart; returns chunk counts |
| `askQuestion(q)` | `POST /query` | non-streaming answer + citations |
| `askQuestionStream(q, handlers)` | `POST /query/stream` | **SSE**; `onToken` / `onCitations` / `onError` |
| `getEvals()` | `GET /evals` | last cached RAGAS run; `null` on 404 |
| `runEvals()` | `POST /evals/run` | kicks off a background run |
| `pingHealth()` | `GET /health` | best-effort keep-alive; never throws |
| `checkReady()` | `GET /health/ready` | are downstream deps reachable? |

### 6.4 Streaming the answer (SSE)

The browser's `EventSource` is GET-only, so for `POST /query/stream` the client reads the response **body as a stream** and parses SSE frames by hand: split on the blank-line `\n\n` separator, read `event:` / `data:` lines, and dispatch — `token` appends text, `citations` attaches sources, `done` ends it. That's what makes the answer "type out" live.

### 6.5 Custom hooks (the reusable behaviors)

- **`useKeepAlive()`** — pings `/health` immediately on mount, then every 9 min, so the free-tier backend stays warm while the app is open. Mounted once at the app root. No-op when disabled.
- **`usePersistentState(key, initial, ttlMs)`** — a `useState` drop-in that mirrors its value to `localStorage` and restores it on the next mount. Entries past the TTL are dropped (the window slides on each write). Degrades gracefully to in-memory state if storage is blocked (private mode). This is what survives navigation and reloads.

### 6.6 Page state: the Chat flow

The Chat page owns the wiring that turns clicks into backend calls:

- **Upload** → each file is added as `processing`, `uploadPdf` runs, then the row flips to `ready` (with a chunk count) or `error` (with the backend's message). A `chunks_stored === 0` result is treated as "scanned/image-only PDF".
- **Ask** → a `user` message + a `pending` assistant bubble are pushed, `askQuestionStream` fills the bubble token-by-token, citations attach at the end. Errors replace the bubble with a clean message.
- **Persistence + healing** → `messages` and `docs` use `usePersistentState`. On mount, any work that was *mid-flight* when the app was last closed (a `pending` message, a `processing` doc) is **healed** into a clean error state so nothing is stuck on a spinner forever.

### 6.7 Conventions

- **One component per folder**, CSS co-located (`Hero/Hero.tsx` + `Hero/Hero.css`).
- **Namespaced class names** (`.hero__headline`) because the CSS is global.
- **Never hard-code colors/spacing** — use the CSS variables from `styles/tokens.css` (`var(--color-accent)`).
- **`@/` path alias** maps to `src/` (set in both `vite.config.ts` and `tsconfig.app.json`), so imports read `@/features/chat`, not `../../../`.

### Where does new code go?

| You're adding… | Put it in… |
|---|---|
| A new page / route | `pages/` + register in `app/App.tsx` |
| A component for one feature | `features/<feature>/components/` |
| A reusable visual primitive | `components/ui/` |
| A backend call | `shared/api/client.ts` (+ a wire type in `types.ts`) |
| An API URL or endpoint | `shared/constants/api.constant.ts` |
| A tunable limit / flag | `shared/constants/config.constant.ts` |
| A generic hook | `shared/hooks/` |
| A color / spacing / font value | `styles/tokens.css` |

---

## 7. Limitations (read this before judging the numbers)

This is a **portfolio / demo** project running on **free tiers**, so some limits are deliberate, not bugs:

- **Free Gemini tier.** The backend uses a free Google Gemini key with hard per-minute caps on embeddings and generation. So **don't upload many large reports at once** or fire rapid-fire questions — you'll hit a rate limit (surfaced as a clean "retry shortly", not a crash).
- **3-document upload cap.** The chat caps uploads at **3 reports** at a time (`MAX_DOCS`), on purpose — the corpus is meant to stay small and focused, and it keeps embedding usage under the free quota. The dropzone disables itself at the limit.
- **Cold starts (~30–60s).** The backend sleeps on the free hosting tier when idle. The first request after a nap is slow. The keep-alive ping helps **only while a browser tab is open** — there's no 24/7 server-side pinger, so an unvisited app still goes to sleep.
- **Evaluation is a small sample.** The bundled/cached RAGAS run was **scored on a single question** (the free-tier quota stopped a fuller run). Treat the dashboard as *one solid data point, not a 12-question benchmark*. The eval endpoints also point at a **local** backend by default (not production), since a full run is slow and quota-heavy.
- **Scanned PDFs won't work.** Ingestion needs **selectable text**. An image-only / scanned 10-K extracts zero text and is rejected (a real signal, shown as an error) — there's no OCR.
- **Browser-side cache, not an account.** History lives in **this browser's localStorage** for 1 week. It's not synced across devices, and clearing site data wipes it. There are no user accounts or auth.

---

## 8. Glossary (every keyword, in plain English)

### React & the app

- **SPA (Single-Page Application)** — the whole app is one HTML page; navigating between Home/Chat/Evaluation swaps content in JavaScript instead of loading new pages.
  *Example: clicking "Evaluation" changes the screen without a full reload — React Router just renders a different component.*
- **Component** — a reusable, self-contained piece of UI (a function returning markup).
  *Example: `<MetricCards metrics={…} />` renders the four score cards anywhere it's used.*
- **Props** — the inputs you pass into a component.
  *Example: `<ChatArea messages={…} onSend={…} />` — `messages` and `onSend` are props.*
- **State** — data a component remembers between renders; changing it re-renders the UI.
  *Example: the list of chat `messages` is state — pushing a new one makes the bubble appear.*
- **Hook** — a function (name starts with `use`) that adds behavior to a component.
  *Example: `usePersistentState("finquery.chat.docs", [], TTL)` behaves like `useState` but also saves to the browser.*
- **Barrel (`index.ts`)** — a file that re-exports a folder's public pieces so others import from one path.
  *Example: `export { ChatArea } from "./components/ChatArea/ChatArea"` lets callers write `import { ChatArea } from "@/features/chat"`.*
- **Feature-first architecture** — grouping code by *domain* (chat, documents, evaluation) instead of by *kind* (all components together, all hooks together).
- **Path alias (`@/`)** — a shortcut for the `src/` folder so imports aren't long `../../` chains.
  *Example: `@/shared/api/client` instead of `../../../shared/api/client`.*
- **Design tokens** — named values (colors, spacing) defined once as CSS variables and reused everywhere.
  *Example: `var(--color-accent)` instead of writing `#4f46e5` in twenty files.*

### Talking to the backend

- **API / endpoint** — a URL on the backend that does one job. *Example: `POST /upload` ingests a PDF.*
- **`fetch`** — the browser's built-in function for making HTTP requests.
- **multipart/form-data** — the encoding used to send a file in a request body. *Example: `uploadPdf` packs the PDF into a `FormData` and POSTs it.*
- **SSE (Server-Sent Events)** — a one-way stream where the server pushes a sequence of small events over a single response. Here, the answer arrives word-by-word.
  *Example: `event: token  data: "Apple's"` … `event: token  data: " net sales"` … `event: done`.*
- **Streaming** — showing the answer as it arrives instead of waiting for the whole thing. It's what makes the reply "type out".
- **Citation** — the source shown with an answer (file + page + snippet + relevance %) so you can verify it.
  *Example: `📄 AppleInc.pdf · p.9 · 74%` → expands to the exact sentence used.*
- **`ApiError`** — the app's error type that carries the HTTP status + the backend's `detail` message, so the UI can show a clean reason. *Example: a 503 becomes "service temporarily unavailable" instead of a blank failure.*

### Quality scores (the Evaluation page)

- **RAGAS** — a tool that scores answer quality automatically using *another* AI as the judge.
- **Faithfulness** — is the answer supported by the retrieved text (no made-up facts)? `1.0` = fully grounded.
- **Answer relevancy** — does the answer actually address the question asked?
- **Context precision** — were the retrieved passages on-target (not noise)?
- **Context recall** — did retrieval pull in *all* the info needed to answer?
  *Example (the bundled run): faithfulness 1.00, relevancy 0.89, precision 0.89, recall 1.00 — scored on one question.*
- **Baseline** — a saved past score to compare against, so you can prove a change improved quality.

### Running & caching

- **Vite** — the tool that runs the fast dev server and builds the production bundle.
- **Environment variable (`VITE_…`)** — a config value read at build time, kept out of the code. *Example: `VITE_API_BASE_URL` decides which backend the app calls.*
- **localStorage** — a small per-browser key-value store that persists across reloads and restarts. *Example: the chat history is saved under `finquery.chat.messages`.*
- **TTL (Time To Live)** — how long a cached value stays valid before it's discarded. *Example: `CHAT_CACHE_TTL_MS` = 1 week.*
- **Keep-alive ping** — a periodic harmless request that stops the idle backend from sleeping. *Example: `GET /health` every 9 minutes while the tab is open.*
- **Cold start** — the delay when a sleeping free-tier server wakes on the first request after idle (~30–60s here).
