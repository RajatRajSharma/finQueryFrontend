// Single source of truth for backend server URLs and API endpoint paths.
// Change the server here once and every request in the app follows.

// ── Server base URLs ─────────────────────────────────────────────────────────

/**
 * Main backend, production (Render) by default.
 * Override per-environment with the VITE_API_BASE_URL env var.
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "https://finquerybackend.onrender.com"
).replace(/\/$/, "");

/**
 * Evaluation backend. RAGAS runs are slow + quota-heavy, so the eval endpoints
 * stay pointed at a separate/local backend instead of the production free tier.
 * Override with the VITE_EVAL_API_BASE_URL env var.
 */
export const EVAL_API_BASE_URL = (
  import.meta.env.VITE_EVAL_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

// ── Endpoint paths ───────────────────────────────────────────────────────────
// Relative paths only; combine with the base URL above at call time.

export const API_ENDPOINTS = {
  /** GET — liveness: is the process up? */
  health: "/health",
  /** GET — readiness: are downstream deps (Qdrant) reachable? */
  ready: "/health/ready",
  /** POST multipart/form-data — ingest a PDF (parse → chunk → embed → store). */
  upload: "/upload",
  /** POST — ask a question; grounded answer + citations. */
  query: "/query",
  /** POST — same as query, but streamed token-by-token over SSE. */
  queryStream: "/query/stream",
  /** GET — last cached RAGAS eval run (served from EVAL_API_BASE_URL). */
  evals: "/evals",
  /** POST — trigger a fresh eval run in the background (EVAL_API_BASE_URL). */
  evalsRun: "/evals/run",
} as const;
