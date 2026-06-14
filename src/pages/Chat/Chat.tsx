import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import DocumentsPanel from "../../components/DocumentsPanel/DocumentsPanel";
import ChatArea from "../../components/ChatArea/ChatArea";
import type { DocItem, Message } from "./types";
import "./Chat.css";

function newId() {
  return Math.random().toString(36).slice(2);
}

function Chat() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [searchParams] = useSearchParams();

  // pre-fill the input from a ?q= param (used by the Home example chips)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setInput(q);
  }, [searchParams]);

  const readyDocs = docs.filter((d) => d.status === "ready");
  const canChat = readyDocs.length > 0;

  // mock ingestion: add as "processing", flip to "ready" after a short delay
  function handleUpload(files: FileList) {
    const added: DocItem[] = Array.from(files).map((f) => ({
      id: newId(),
      name: f.name,
      status: "processing",
    }));
    setDocs((prev) => [...prev, ...added]);

    added.forEach((doc) => {
      setTimeout(() => {
        setDocs((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, status: "ready" } : d))
        );
      }, 1800);
    });
  }

  // mock answer: no backend yet, so reply with a placeholder + sample citation
  function handleSend() {
    const question = input.trim();
    if (!question || !canChat) return;

    const userMsg: Message = { id: newId(), role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const sourceDoc = readyDocs[0].name;
    const reply: Message = {
      id: newId(),
      role: "assistant",
      text: "This is a demo response — FinQuery isn't connected to its backend yet. Once the API is wired up, you'll get a real answer here, streamed token by token and grounded in your uploaded reports.",
      citations: [{ doc: sourceDoc, page: 31 }],
    };
    setTimeout(() => setMessages((prev) => [...prev, reply]), 600);
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
