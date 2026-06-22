import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppHeader from "@/app/layout/AppHeader/AppHeader";
import { DocumentsPanel } from "@/features/documents";
import type { DocItem } from "@/features/documents";
import { ChatArea, DEFAULT_CHAT_SETTINGS } from "@/features/chat";
import type { Message, ChatSettings } from "@/features/chat";
import { newId } from "@/shared/lib/id";
import { uploadPdf, askQuestionStream, ApiError } from "@/shared/api/client";
import { usePersistentState } from "@/shared/hooks/usePersistentState";
import { MAX_DOCS, CHAT_CACHE_TTL_MS } from "@/shared/constants";
import "./Chat.css";

function Chat() {
  const [searchParams] = useSearchParams();
  // Persisted across navigation / reloads (1-week cache) so messages aren't lost
  // and uploaded docs don't need re-uploading.
  const [docs, setDocs] = usePersistentState<DocItem[]>(
    "finquery.chat.docs",
    [],
    CHAT_CACHE_TTL_MS
  );
  const [messages, setMessages] = usePersistentState<Message[]>(
    "finquery.chat.messages",
    [],
    CHAT_CACHE_TTL_MS
  );
  // pre-fill the input from a ?q= param (used by the Home example chips),
  // read once on mount so we don't fight the user's later edits.
  const [input, setInput] = useState(() => searchParams.get("q") ?? "");
  const [busy, setBusy] = useState(false);
  // Retrieval knobs (hybrid / rerank) the user flips from the input bar.
  // Persisted so the choice survives reloads, like the rest of the chat state.
  const [settings, setSettings] = usePersistentState<ChatSettings>(
    "finquery.chat.settings",
    DEFAULT_CHAT_SETTINGS,
    CHAT_CACHE_TTL_MS
  );

  // Restored state may hold work that was mid-flight when the app was last
  // closed/navigated away (the stream/upload didn't resume). Heal it once on
  // mount so nothing is stuck on a spinner forever.
  useEffect(() => {
    setMessages((prev) =>
      prev.some((m) => m.pending)
        ? prev.map((m) =>
            m.pending
              ? {
                  ...m,
                  pending: false,
                  error: true,
                  text: "Interrupted — please ask again.",
                }
              : m
          )
        : prev
    );
    setDocs((prev) =>
      prev.some((d) => d.status === "processing")
        ? prev.map((d) =>
            d.status === "processing"
              ? {
                  ...d,
                  status: "error" as const,
                  detail: "Upload interrupted — please re-upload.",
                }
              : d
          )
        : prev
    );
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const readyDocs = docs.filter((d) => d.status === "ready");
  const canChat = readyDocs.length > 0 && !busy;

  function patchDoc(id: string, patch: Partial<DocItem>) {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  // Real ingestion: add each file as "processing", POST it to /upload, then
  // flip to "ready" (with a chunk count) or "error" with the backend's message.
  function handleUpload(files: FileList) {
    // Only accept up to the remaining slots under the MAX_DOCS cap; ignore extras.
    const remaining = MAX_DOCS - docs.length;
    if (remaining <= 0) return;
    const accepted = Array.from(files).slice(0, remaining);

    const added: DocItem[] = accepted.map((f) => ({
      id: newId(),
      name: f.name,
      status: "processing" as const,
    }));
    setDocs((prev) => [...prev, ...added]);

    added.forEach((doc, i) => {
      const file = accepted[i];
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

  // Remove a single uploaded report from the list on the spot. Local-only —
  // the chat keeps working against whatever reports remain indexed.
  function handleRemoveDoc(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  // Start a fresh conversation. Keeps the uploaded docs (they're already indexed
  // in the backend) so the user doesn't have to re-upload — only the chat clears.
  function handleClear() {
    if (messages.length === 0) return;
    if (!window.confirm("Start a new chat? This clears the current conversation."))
      return;
    setMessages([]);
    setInput("");
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
    }, { useHybrid: settings.useHybrid, useRerank: settings.useRerank })
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
        <DocumentsPanel
          docs={docs}
          onUpload={handleUpload}
          onRemove={handleRemoveDoc}
        />
        <ChatArea
          messages={messages}
          input={input}
          canChat={canChat}
          hasDocs={docs.length > 0}
          settings={settings}
          onSettingsChange={setSettings}
          onInputChange={setInput}
          onSend={handleSend}
          onClear={handleClear}
        />
      </div>
    </div>
  );
}

export default Chat;
