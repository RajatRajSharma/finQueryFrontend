// Types for the documents feature.

export interface DocItem {
  id: string;
  name: string;
  status: "processing" | "ready";
}
