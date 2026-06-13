# FinQuery — UI Base Plan

> **What this doc is:** the front-end plan for FinQuery. Covers the website concept, the three pages, what each contains, and polish ideas to make it look professional. Pairs with finQueryArchitecture.md (system) and finQueryEvaluation.md (metrics).

---

## 1. Website concept

**FinQuery** is a web app that lets anyone chat with real company annual reports (10-K filings) and get answers grounded in the actual documents, with source citations. Instead of reading a 200-page report, you ask a question in plain English and get a cited answer in seconds.

The site has two distinct parts:
- **A public landing page** (Home) — markets the project, explains what it does, invites people to try it.
- **An app workspace** (behind the landing page) — where the real work happens: a Chat view and an Evaluation view.

This split mirrors how real products are built — a marketing page in front of an application — and that separation itself signals product sense to anyone reviewing the project.

---

## 2. Page structure (3 pages, 2 of them inside one workspace)

| Route | Page | Purpose |
|---|---|---|
| `/` | Home | Public landing page — introduce, explain, invite |
| `/app` | Chat | Upload documents + ask questions (the core experience) |
| `/app/evaluation` | Evaluation | RAGAS scores and charts (the standout feature) |

**Navigation rules:**
- Home links to the app via a "Launch app" / "Try it now" button. It lands on Chat by default.
- The app has a shared header with a small toggle to switch between Chat and Evaluation.
- Home does NOT link directly to Evaluation — the eval dashboard only makes sense once you understand the chat, so it lives inside the app, one click from Chat.

**Why Evaluation is a full page, not a popup:** it has real content (metric cards, a bar chart, possibly a per-question table). A modal would feel cramped and look amateur. A full sibling view to Chat is the clean, professional choice.

---

## 3. Page 1 — Home (landing page)

Top-to-bottom section order (a proven landing-page flow):

### Section 1 — Hero
- Headline: e.g. "Chat with annual reports, get cited answers."
- One-line subhead explaining the value.
- A primary call-to-action button: "Try it now" → launches the app.
- A small looping animation (see polish ideas below).

### Section 2 — What it solves
- 3 short value cards, e.g.:
  - "Skip the 200-page read" — get answers in seconds.
  - "Answers with sources" — every answer cites the exact document and page.
  - "Compare companies instantly" — ask across multiple reports at once.

### Section 3 — How it helps (with images)
- Alternating image + text rows showing the real flow: upload a report → ask a question → get a cited answer.
- Use real screenshots of the app once built (more convincing than illustrations).

### Section 4 — Use cases to try
- A row of clickable example-question chips: "What was Apple's revenue?", "What are Tesla's risk factors?", "Compare operating margins".
- Clicking a chip launches the app with that question pre-filled and auto-sent. This is the single best engagement trick — it turns a passive visitor into someone watching the RAG work within seconds.

### Section 5 — Contact the creator
- A short feedback prompt with a "Send feedback" button or small form.
- Simplest reliable approach: a `mailto:` link that opens the visitor's email client with your address pre-filled. No backend needed.
- Alternative (no email client required): a free form service like Formspree or Web3Forms — a few lines, no backend. `mailto:` is perfectly fine for a portfolio.

---

## 4. Page 2 — Chat (the core experience)

Layout: a documents panel on the left, the chat area in the center.

**Documents panel (left):**
- "Upload PDF" button (also supports drag-and-drop).
- List of uploaded reports, each with an icon; the active/processing one shows a spinner during ingestion, a checkmark when ready.
- A small "Eval dashboard" link at the bottom that switches to the Evaluation view.

**Chat area (center):**
- Conversation history: user questions as bubbles on the right, answers on the left.
- Answers stream in token-by-token (live "typing" effect via SSE).
- Under each answer: source citation chips showing the document name and page number — the single most important UI element, because it proves the answer is grounded, not hallucinated.
- An input box at the bottom, disabled until at least one document is uploaded, with a clear empty state ("Upload an annual report to get started").

**Behavior decision:** questions search ALL uploaded documents by default (rather than making the user pick one first). "Compare across companies" is a more impressive demo than "pick a file first."

---

## 5. Page 3 — Evaluation (the standout feature)

A clean dashboard view showing how well the RAG performs.

- **Metric cards** at the top: faithfulness, answer relevancy, context precision — each a big number (0 to 1).
- **A bar chart** comparing the three metrics, or a before/after comparison if you have it (e.g. "with vs without reranking").
- **(Optional) a per-question table** showing each test question and its scores, so the detail is there for anyone who wants it.
- A short note explaining what each metric means, so a viewer who's never heard of RAGAS understands instantly.

This is the page to screenshot for your README and to open during interviews.

---

## 6. Polish ideas — what makes it look good

Small touches that lift a portfolio project from "works" to "looks professional":

- **Consistent design system.** Pick one accent color, one font pair, consistent spacing and rounded corners. Tailwind makes this easy. Consistency reads as polish more than any single fancy element.
- **Light/dark mode toggle.** Cheap to add with Tailwind, and instantly signals attention to detail.
- **Skeleton loaders / spinners.** Show a loading state during PDF ingestion and while an answer is being retrieved, so the app never feels frozen.
- **Smooth micro-animations.** Fade-in messages, a subtle hover lift on cards, the streaming "typing" effect. A lightweight library like Framer Motion handles this cleanly; respect `prefers-reduced-motion` for accessibility.
- **Empty states with personality.** The first-open chat screen and an "ingesting your first report" state should feel intentional, not blank.
- **The hero animation.** Keep it tasteful on a finance tool. An animation that *shows the product* (a tiny mockup of a question being asked and an answer streaming in) impresses more than a literal car. If you want a car, a small CSS-animated one is fine — just keep it subtle and respect reduced-motion.
- **Recognizable company names/logos** in the documents panel — makes the demo instantly relatable to anyone watching.
- **Responsive layout.** Make sure it works on a laptop and a phone; a recruiter may open it on mobile.
- **A polished favicon and page title.** Tiny detail, but a default Vite favicon screams "unfinished."
- **Toast notifications** for actions like "Report uploaded" or "Upload failed" — small, professional feedback.

---

## 7. State-passing note (for later, when coding)

The use-case chips on Home need to pass a pre-filled question into the Chat view. The simplest way is via a URL query param (e.g. `/app?q=Apple's revenue`), which the Chat view reads on load — no global state library needed.

---

## 8. Tech for the front end (recap)

- React + Vite + TypeScript
- Tailwind CSS for styling
- React Router for the three routes
- `@microsoft/fetch-event-source` for SSE token streaming
- lucide-react for icons
- (Optional) Framer Motion for animations
