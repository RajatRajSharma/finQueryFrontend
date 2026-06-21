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
