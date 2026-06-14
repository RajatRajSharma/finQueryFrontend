// Types for the chat feature.

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
