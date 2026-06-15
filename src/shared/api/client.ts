// Thin HTTP client for the FinQuery backend.
//
// One place that knows the API base URL and how to turn a non-2xx response
// into a useful Error (the backend returns {"detail": "..."} on 4xx/5xx, e.g.
// a 503 when Gemini/Qdrant is down). Everything else imports these functions.

import type {
  IngestionResponse,
  QueryResponse,
  ReadinessResponse,
} from "./types";

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

/** Error carrying the HTTP status so callers can branch (e.g. 503 vs 400). */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
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
  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw await toError(res);
  return (await res.json()) as IngestionResponse;
}

/** POST /query — ask a question, get a grounded answer + citations. */
export async function askQuestion(
  question: string,
  topK?: number
): Promise<QueryResponse> {
  const res = await fetch(`${BASE_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, top_k: topK ?? null }),
  });
  if (!res.ok) throw await toError(res);
  return (await res.json()) as QueryResponse;
}

/** GET /health/ready — is the backend's vector store reachable? */
export async function checkReady(): Promise<ReadinessResponse> {
  const res = await fetch(`${BASE_URL}/health/ready`);
  if (!res.ok) throw await toError(res);
  return (await res.json()) as ReadinessResponse;
}
