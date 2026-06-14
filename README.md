# FinQuery — Frontend

Chat with company annual reports (10-K filings) and get answers grounded in the
actual documents, with source citations. This repo is the **frontend** only: a
React + TypeScript + Vite single-page app.

It has three views:

| Route | Page | What it does |
|---|---|---|
| `/` | Home | Public landing page — explains the product, invites you to try it |
| `/app` | Chat | Upload PDFs and ask questions (the core experience) |
| `/app/evaluation` | Evaluation | RAGAS quality scores and charts |

> **Note:** the backend isn't wired up yet. Uploads, answers, and the evaluation
> scores are currently realistic **mock/demo** behavior. The mock spots are
> isolated in `src/pages/Chat/Chat.tsx` (`handleUpload` / `handleSend`) and the
> `METRICS` / `QUESTIONS` constants in `src/pages/Evaluation/Evaluation.tsx`.

---

## Requirements

- **Node.js 20+** (Vite 8 requires a modern Node)
- **npm** (comes with Node)

Check your version with `node -v`.

---

## Install & run

```bash
# 1. install dependencies
npm install

# 2. start the dev server (hot reload)
npm run dev
```

Then open the URL it prints — usually **http://localhost:5173/**.

### Other scripts

```bash
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build locally
npm run lint      # run ESLint
```

---

## Tech stack

- **React 19** + **TypeScript**
- **Vite** (dev server + build)
- **React Router** (routing between the three pages)
- Plain **CSS** per component (no UI framework) with shared design tokens

---

## Folder structure

The app is organised **feature-first**: everything about a domain (its
components, types, and later its hooks/api) lives in one folder, instead of being
split across global `components/`, `hooks/`, `api/` folders.

```
src/
├── main.tsx                  # entry point — mounts <App/> inside the router
│
├── app/                      # app-wide wiring (the "shell")
│   ├── App.tsx               # route table (/, /app, /app/evaluation)
│   └── layout/
│       └── AppHeader/        # shared top bar for the Chat + Evaluation views
│
├── pages/                    # route entry points — thin, just compose features
│   ├── Home/                 # assembles the marketing sections
│   ├── Chat/                 # documents panel + chat area + mock state
│   └── Evaluation/           # metric cards + chart + table
│
├── features/                 # the bulk of the app — one folder per domain
│   ├── marketing/            # landing-page sections
│   │   ├── components/        #   Header, Hero, ValueCards, HowItHelps,
│   │   │                      #   UseCases, Contact, Footer
│   │   └── index.ts           #   public surface (barrel)
│   ├── chat/
│   │   ├── components/        #   ChatArea
│   │   ├── types.ts           #   Message, Citation
│   │   └── index.ts
│   ├── documents/
│   │   ├── components/        #   DocumentsPanel
│   │   ├── types.ts           #   DocItem
│   │   └── index.ts
│   └── evaluation/
│       ├── components/        #   MetricCards, MetricBarChart, QuestionsTable
│       └── index.ts
│
├── components/
│   └── ui/                   # shared, generic UI primitives (design system)
│       ├── Logo/             #   the FinQuery brand mark, reused everywhere
│       └── index.ts
│
├── shared/                   # cross-cutting NON-UI code
│   └── lib/
│       └── id.ts             # generic helpers (e.g. newId())
│
├── styles/                   # global styles
│   ├── tokens.css            # design tokens: colors, spacing, radius, fonts
│   └── base.css              # reset + shared helpers (.container, .btn …)
│
└── assets/                   # images / gifs
```

### How the layers relate

- **`pages/`** are thin — they import features and arrange them. No business logic.
- **`features/`** own their domain. Each exposes a clean public API through its
  `index.ts` barrel, so the rest of the app imports
  `from "@/features/chat"`, never deep paths.
- **`components/ui/`** holds generic, reusable pieces that know nothing about
  FinQuery (e.g. `Logo`). A piece lives inside its feature until a *second*
  feature needs it, then it graduates here.
- **`shared/`** is for non-visual common code (utils, hooks, types).
- **`styles/`** is the single source of truth for the visual system.

### Where does new code go?

| You're adding… | Put it in… |
|---|---|
| A new page / route | `pages/` + register it in `app/App.tsx` |
| A component for one feature | `features/<feature>/components/` |
| A reusable visual primitive (Button, Card…) | `components/ui/` |
| A generic helper function | `shared/lib/` |
| A generic hook | `shared/hooks/` |
| A color / spacing / font value | `styles/tokens.css` |

---

## Path alias

Imports use the `@/` alias instead of long relative paths:

```ts
import { Logo } from "@/components/ui";
import { ChatArea } from "@/features/chat";
```

`@/` maps to `src/` — configured in both `vite.config.ts` and `tsconfig.app.json`.

---

## Conventions

- One component per folder, with its CSS co-located (`Button/Button.tsx` +
  `Button/Button.css`).
- CSS class names are namespaced per component (e.g. `.hero__headline`) to avoid
  collisions, since the CSS is global.
- Import shared values from `styles/tokens.css` via CSS variables
  (`var(--color-accent)`), never hard-code colors.
