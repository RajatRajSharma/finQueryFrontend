// App-wide tunable settings (non-secret limits / behaviour) in one place.

/**
 * Max number of report PDFs that can be uploaded in the chat at a time.
 * The corpus is small, so we cap it to keep things focused.
 */
export const MAX_DOCS = 3;

/** How long to wait between polls while a background eval run finishes. */
export const EVAL_POLL_INTERVAL_MS = 5000;

/** Max number of polls before we stop waiting on a background eval run. */
export const EVAL_POLL_MAX_ATTEMPTS = 60;

// ── Backend keep-alive ───────────────────────────────────────────────────────
// The production backend runs on Render's free tier, which sleeps after ~15 min
// idle (then a cold start adds ~30–60s). A lightweight client-side ping keeps it
// warm while the app is open. Both knobs are env-overridable.

/** Master switch for the keep-alive pinger. Set VITE_KEEPALIVE_ENABLED=false to disable. */
export const KEEPALIVE_ENABLED =
  (import.meta.env.VITE_KEEPALIVE_ENABLED ?? "true") !== "false";

/** How often to ping /health. Defaults to 9 min (under Render's ~15 min idle window). */
export const KEEPALIVE_INTERVAL_MS = Number(
  import.meta.env.VITE_KEEPALIVE_INTERVAL_MS ?? 9 * 60 * 1000
);

// ── Chat persistence ─────────────────────────────────────────────────────────

/**
 * How long the chat conversation + uploaded-doc list survive in the browser
 * (localStorage), so navigating away or reloading doesn't lose messages and the
 * docs don't need re-uploading. Defaults to 1 week; the window slides on use.
 * Override with VITE_CHAT_CACHE_TTL_MS (in milliseconds).
 */
export const CHAT_CACHE_TTL_MS = Number(
  import.meta.env.VITE_CHAT_CACHE_TTL_MS ?? 7 * 24 * 60 * 60 * 1000
);
