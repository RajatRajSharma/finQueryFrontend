// Types for the chat feature.

export interface Citation {
  doc: string;
  page: number;
  company?: string;
  snippet?: string;
  score?: number; // 0..1 relevance from the backend
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
  pending?: boolean; // assistant bubble waiting on the backend
  error?: boolean; // assistant bubble that reports a failure
}

/**
 * Retrieval knobs the user can flip from the chat input bar. Each maps to a
 * query param on /query and /query/stream (see API_DOCS.md).
 */
export interface ChatSettings {
  /** use_hybrid — dense + BM25 fusion on/off for this request. */
  useHybrid: boolean;
  /** use_rerank — Cohere reranking on/off (no-op if no key on the backend). */
  useRerank: boolean;
}

/** Default retrieval settings — both knobs off. */
export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  useHybrid: false,
  useRerank: false,
};
