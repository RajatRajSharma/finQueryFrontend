// Wire types — mirror the backend's app/models/schemas.py exactly.
// Keep these in sync with the FastAPI response_model shapes.

export interface IngestionResponse {
  source_file: string;
  company: string;
  pages_parsed: number;
  chunks_created: number;
  chunks_stored: number;
}

export interface ApiCitation {
  source_file: string;
  company: string;
  page_number: number;
  snippet: string;
  score: number;
}

export interface QueryResponse {
  answer: string;
  citations: ApiCitation[];
}

export interface ReadinessResponse {
  status: "ready" | "degraded";
  dependencies: Record<string, boolean>;
}
