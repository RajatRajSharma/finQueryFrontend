// Shared types for the Chat page (documents + conversation).

export interface DocItem {
  id: string;
  name: string;
  status: "processing" | "ready";
}

export interface Citation {
  doc: string;
  page: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
}
