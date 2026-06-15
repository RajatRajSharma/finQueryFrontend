// Types for the documents feature.

export interface DocItem {
  id: string;
  name: string;
  status: "processing" | "ready" | "error";
  // Populated when status === "error" (shown on hover) or when ready, the
  // number of chunks the backend stored (useful feedback that text was found).
  detail?: string;
}
