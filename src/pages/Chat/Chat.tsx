import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppHeader from "@/app/layout/AppHeader/AppHeader";
import { DocumentsPanel } from "@/features/documents";
import type { DocItem } from "@/features/documents";
import { ChatArea } from "@/features/chat";
import type { Message } from "@/features/chat";
import { newId } from "@/shared/lib/id";
import { uploadPdf, askQuestionStream, ApiError } from "@/shared/api/client";
import "./Chat.css";

function Chat() {
  const [searchParams] = useSearchParams();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  // pre-fill the input from a ?q= param (used by the Home example chips),
  // read once on mount so we don't fight the user's later edits.
  const [input, setInput] = useState(() => searchParams.get("q") ?? "");
  const [busy, setBusy] = useState(false);

  const readyDocs = docs.filter((d) => d.status === "ready");
  const canChat = readyDocs.length > 0 && !busy;

  function patchDoc(id: string, patch: Partial<DocItem>) {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  // Real ingestion: add each file as "processing", POST it to /upload, then
  // flip to "ready" (with a chunk count) or "error" with the backend's message.
  function handleUpload(files: FileList) {
    const added: DocItem[] = Array.from(files).map((f) => ({
      id: newId(),
      name: f.name,
      status: "processing" as const,
    }));
    setDocs((prev) => [...prev, ...added]);

    added.forEach((doc, i) => {
      const file = files[i];
      uploadPdf(file)
        .then((res) => {
          if (res.chunks_stored === 0) {
            // Parsed fine but no text — almost always an image-only/scanned PDF.
            patchDoc(doc.id, {
              status: "error",
              detail:
                "No selectable text found (looks like a scanned/image-only PDF).",
            });
          } else {
            patchDoc(doc.id, {
              status: "ready",
              detail: `${res.chunks_stored} chunks indexed`,
            });
          }
        })
        .catch((err: unknown) => {
          const msg =
            err instanceof ApiError
              ? err.message
              : "Upload failed — is the backend running?";
          patchDoc(doc.id, { status: "error", detail: msg });
        });
    });
  }

  // Real query: push the question + a pending assistant bubble, call /query,
  // then replace the bubble with the grounded answer (or an error message).
  function handleSend() {
    const question = input.trim();
    if (!question || !canChat) return;

    const userMsg: Message = { id: newId(), role: "user", text: question };
    const pendingId = newId();
    const pendingMsg: Message = {
      id: pendingId,
      role: "assistant",
      text: "Searching your reports…",
      pending: true,
    };
    setMessages((prev) => [...prev, userMsg, pendingMsg]);
    setInput("");
    setBusy(true);

    const patch = (fn: (m: Message) => Message) =>
      setMessages((prev) => prev.map((m) => (m.id === pendingId ? fn(m) : m)));

    askQuestionStream(question, {
      // Append each token; the first one clears the "Searching…" placeholder.
      onToken: (delta) =>
        patch((m) => ({ ...m, pending: false, text: (m.pending ? "" : m.text) + delta })),
      onCitations: (cites) =>
        patch((m) => ({
          ...m,
          citations: cites.map((c) => ({
            doc: c.source_file,
            page: c.page_number,
            company: c.company,
            snippet: c.snippet,
            score: c.score,
          })),
        })),
      onError: (msg) =>
        patch((m) => ({ ...m, pending: false, error: true, text: msg })),
    })
      .catch((err: unknown) => {
        const msg =
          err instanceof ApiError
            ? err.message
            : "Something went wrong reaching the backend. Please try again.";
        patch((m) => ({ ...m, pending: false, error: true, text: msg }));
      })
      .finally(() => setBusy(false));
  }

  return (
    <div className="chat-page">
      <AppHeader />
      <div className="chat-page__body">
        <DocumentsPanel docs={docs} onUpload={handleUpload} />
        <ChatArea
          messages={messages}
          input={input}
          canChat={canChat}
          hasDocs={docs.length > 0}
          onInputChange={setInput}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}

export default Chat;
