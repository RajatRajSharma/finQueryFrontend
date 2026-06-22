// Thin HTTP client for the FinQuery backend.
//
// One place that knows the API base URL and how to turn a non-2xx response
// into a useful Error (the backend returns {"detail": "..."} on 4xx/5xx, e.g.
// a 503 when Gemini/Qdrant is down). Everything else imports these functions.

import type {
  ApiCitation,
  EvalResponse,
  IngestionResponse,
  QueryResponse,
  ReadinessResponse,
} from "./types";
import {
  API_BASE_URL,
  EVAL_API_BASE_URL,
  API_ENDPOINTS,
} from "@/shared/constants";

/** Error carrying the HTTP status so callers can branch (e.g. 503 vs 400). */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Per-request retrieval overrides → query params on /query and /query/stream. */
export interface QueryOptions {
  useHybrid?: boolean;
  useRerank?: boolean;
}

/** Turn QueryOptions into a "?use_hybrid=…&use_rerank=…" string (or ""). */
function queryParams(opts?: QueryOptions): string {
  if (!opts) return "";
  const params = new URLSearchParams();
  if (typeof opts.useHybrid === "boolean")
    params.set("use_hybrid", String(opts.useHybrid));
  if (typeof opts.useRerank === "boolean")
    params.set("use_rerank", String(opts.useRerank));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Pull the backend's {detail} message out of a failed response. */
async function toError(res: Response): Promise<ApiError> {
  let detail = `Request failed (${res.status})`;
  try {
    const body = (await res.json()) as { detail?: string };
    if (body?.detail) detail = body.detail;
  } catch {
    // Non-JSON body (e.g. a raw 500) — keep the generic message.
  }
  return new ApiError(res.status, detail);
}

/** POST /upload — ingest a PDF (parse → chunk → embed → store). */
export async function uploadPdf(file: File): Promise<IngestionResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.upload}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw await toError(res);
  return (await res.json()) as IngestionResponse;
}

/** POST /query — ask a question, get a grounded answer + citations. */
export async function askQuestion(
  question: string,
  opts?: QueryOptions,
  topK?: number
): Promise<QueryResponse> {
  const res = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.query}${queryParams(opts)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, top_k: topK ?? null }),
    }
  );
  if (!res.ok) throw await toError(res);
  return (await res.json()) as QueryResponse;
}

export interface StreamHandlers {
  onToken: (text: string) => void;
  onCitations: (citations: ApiCitation[]) => void;
  onError: (message: string) => void;
}

/** Dispatch one parsed SSE event block to the right handler. */
function dispatchEvent(block: string, handlers: StreamHandlers): boolean {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith(":")) continue; // comment / keep-alive ping
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).replace(/^ /, ""));
  }
  const data = dataLines.join("\n"); // SSE rejoins multi-line data with \n
  if (event === "token") handlers.onToken(data);
  else if (event === "citations") handlers.onCitations(JSON.parse(data) as ApiCitation[]);
  else if (event === "error") handlers.onError(data);
  else if (event === "done") return true;
  return false;
}

/**
 * POST /query/stream — stream the answer over SSE.
 * EventSource is GET-only, so we read the response body as a stream and parse
 * SSE frames manually. Resolves when the `done` event arrives or the stream ends.
 */
export async function askQuestionStream(
  question: string,
  handlers: StreamHandlers,
  opts?: QueryOptions,
  topK?: number
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.queryStream}${queryParams(opts)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, top_k: topK ?? null }),
    }
  );
  if (!res.ok || !res.body) throw await toError(res);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer = (buffer + decoder.decode(value, { stream: true })).replace(/\r\n/g, "\n");
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      if (dispatchEvent(block, handlers)) return;
    }
  }
}

/** GET /evals — the last cached RAGAS run, or null if none exists yet (404). */
export async function getEvals(): Promise<EvalResponse | null> {
  const res = await fetch(`${EVAL_API_BASE_URL}${API_ENDPOINTS.evals}`);
  if (res.status === 404) return null;
  if (!res.ok) throw await toError(res);
  return (await res.json()) as EvalResponse;
}

/** POST /evals/run — trigger a fresh eval in the background (returns immediately). */
export async function runEvals(asBaseline = false): Promise<void> {
  const res = await fetch(
    `${EVAL_API_BASE_URL}${API_ENDPOINTS.evalsRun}?as_baseline=${asBaseline}`,
    { method: "POST" }
  );
  // 409 = a run is already in progress; treat as "already running", not an error.
  if (!res.ok && res.status !== 409) throw await toError(res);
}

/**
 * GET /health — lightweight liveness ping used to keep the (free-tier) backend
 * awake. Best-effort: never throws, so a sleeping/cold backend stays silent.
 */
export async function pingHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.health}`);
    return res.ok;
  } catch {
    return false;
  }
}

/** GET /health/ready — is the backend's vector store reachable? */
export async function checkReady(): Promise<ReadinessResponse> {
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ready}`);
  if (!res.ok) throw await toError(res);
  return (await res.json()) as ReadinessResponse;
}
