import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppHeader from "@/app/layout/AppHeader/AppHeader";
import { DocumentsPanel } from "@/features/documents";
import type { DocItem } from "@/features/documents";
import { ChatArea } from "@/features/chat";
import type { Message } from "@/features/chat";
import { newId } from "@/shared/lib/id";
import { uploadPdf, askQuestion, ApiError } from "@/shared/api/client";
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

    askQuestion(question)
      .then((res) => {
        const citations = res.citations.map((c) => ({
          doc: c.source_file,
          page: c.page_number,
        }));
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? { id: pendingId, role: "assistant", text: res.answer, citations }
              : m
          )
        );
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof ApiError
            ? err.message
            : "Something went wrong reaching the backend. Please try again.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? { id: pendingId, role: "assistant", text: msg, error: true }
              : m
          )
        );
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
