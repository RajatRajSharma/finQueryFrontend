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
  pending?: boolean; // assistant bubble waiting on the backend
  error?: boolean; // assistant bubble that reports a failure
}
