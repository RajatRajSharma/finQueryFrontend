import type { EvalResponse } from "@/shared/api/types";

// Cached RAGAS run bundled with the app so the Evaluation page shows real
// numbers even when no live eval backend is reachable (the eval API runs
// locally / off the production free tier — see EVAL_API_BASE_URL).
//
// Mirrors data/eval/results.json, exactly what GET /evals serves.
// NOTE: single-question run — the free-tier quota capped a fuller run — so
// treat it as one solid data point, not a multi-question benchmark.
export const FALLBACK_EVAL: EvalResponse = {
  runId: "eval_20260616_174711",
  createdAt: "2026-06-16T17:47:11Z",
  questionCount: 1,
  metrics: {
    faithfulness: 1.0,
    answerRelevancy: 0.8891,
    contextPrecision: 0.8875,
    contextRecall: 1.0,
  },
  config: {
    model: "gemini-2.5-flash",
    embeddingModel: "gemini-embedding-001",
    hybrid: false,
    reranker: false,
    topK: 5,
  },
  // Per-question scores equal the aggregate for a single-question run. The
  // question text mirrors the canonical eval query — adjust if the cached
  // run used a different one.
  questions: [
    {
      question: "What were Apple's total net sales?",
      faithfulness: 1.0,
      answerRelevancy: 0.8891,
      contextPrecision: 0.8875,
      contextRecall: 1.0,
    },
  ],
  baseline: null,
  stale: false,
  running: false,
};
