import { useEffect, useRef } from "react";
import type { Message } from "../../types";
import "./ChatArea.css";

interface Props {
  messages: Message[];
  input: string;
  canChat: boolean;
  hasDocs: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onClear: () => void;
}

function ChatArea({
  messages,
  input,
  canChat,
  hasDocs,
  onInputChange,
  onSend,
  onClear,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  // keep the latest message in view
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  const placeholder = !hasDocs
    ? "Upload an annual report to get started"
    : !canChat
    ? "Hang on, your report is still processing…"
    : "Ask a question about your reports…";

  return (
    <section className="chat">
      {messages.length > 0 && (
        <div className="chat__topbar">
          <button
            className="chat__new"
            onClick={onClear}
            title="Clear this conversation and start fresh (keeps your uploaded reports)"
          >
            ＋ New chat
          </button>
        </div>
      )}
      <div className="chat__messages">
        {messages.length === 0 ? (
          <div className="chat__empty">
            <div className="chat__empty-icon">💬</div>
            <h2 className="chat__empty-title">
              {hasDocs
                ? "Ask anything about your reports"
                : "Upload an annual report to get started"}
            </h2>
            <p className="chat__empty-text">
              Questions search across every document you upload, so you can
              compare companies in a single ask.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div className={`chat__msg chat__msg--${m.role}`} key={m.id}>
              <div
                className={`chat__bubble${m.pending ? " chat__bubble--pending" : ""}${
                  m.error ? " chat__bubble--error" : ""
                }`}
              >
                {m.text}
              </div>
              {m.citations && m.citations.length > 0 && (
                <div className="chat__citations">
                  {m.citations.map((c, i) => (
                    <details className="chat__cite" key={i}>
                      <summary className="chat__cite-summary">
                        📄 {c.doc} · p.&nbsp;{c.page}
                        {typeof c.score === "number" && (
                          <span className="chat__cite-score">
                            {Math.round(c.score * 100)}%
                          </span>
                        )}
                      </summary>
                      {c.snippet && (
                        <p className="chat__cite-snippet">{c.snippet}</p>
                      )}
                    </details>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <div className="chat__inputbar">
        <textarea
          className="chat__input"
          rows={1}
          value={input}
          placeholder={placeholder}
          disabled={!canChat}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="btn btn-primary chat__send"
          onClick={onSend}
          disabled={!canChat || !input.trim()}
        >
          Send
        </button>
      </div>
    </section>
  );
}

export default ChatArea;
