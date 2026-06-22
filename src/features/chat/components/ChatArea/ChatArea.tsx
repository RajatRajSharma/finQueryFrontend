import { useEffect, useRef, useState } from "react";
import type { Message, ChatSettings } from "../../types";
import "./ChatArea.css";

interface Props {
  messages: Message[];
  input: string;
  canChat: boolean;
  hasDocs: boolean;
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onClear: () => void;
}

// The two retrieval knobs, with the copy shown in the hover tooltips.
const SETTING_OPTIONS: {
  key: keyof ChatSettings;
  label: string;
  hint: string;
}[] = [
  {
    key: "useHybrid",
    label: "Hybrid search",
    hint: "Blend keyword (BM25) matching with semantic vector search. Helps catch exact figures and terms a pure semantic search might miss.",
  },
  {
    key: "useRerank",
    label: "Rerank results",
    hint: "Re-score the retrieved passages with a reranker so the most relevant context lands at the top before the answer is written.",
  },
];

function ChatArea({
  messages,
  input,
  canChat,
  hasDocs,
  settings,
  onSettingsChange,
  onInputChange,
  onSend,
  onClear,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // keep the latest message in view
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close the settings popover on an outside click or Escape.
  useEffect(() => {
    if (!settingsOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!settingsRef.current?.contains(e.target as Node)) setSettingsOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSettingsOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [settingsOpen]);

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
        <div className="chat__settings" ref={settingsRef}>
          <button
            type="button"
            className={`chat__settings-btn${settingsOpen ? " is-open" : ""}`}
            onClick={() => setSettingsOpen((o) => !o)}
            aria-label="Retrieval settings"
            aria-expanded={settingsOpen}
            title="Retrieval settings"
          >
            ⚙
          </button>

          {settingsOpen && (
            <div className="chat__settings-pop" role="dialog" aria-label="Retrieval settings">
              <div className="chat__settings-head">Retrieval settings</div>
              {SETTING_OPTIONS.map((opt) => (
                <div className="chat__setting" key={opt.key}>
                  <span className="chat__setting-label">
                    {opt.label}
                    <span className="chat__tip" role="tooltip">
                      {opt.hint}
                    </span>
                  </span>
                  <button
                    type="button"
                    className={`chat__toggle${settings[opt.key] ? " is-on" : ""}`}
                    role="switch"
                    aria-checked={settings[opt.key]}
                    aria-label={opt.label}
                    onClick={() =>
                      onSettingsChange({ ...settings, [opt.key]: !settings[opt.key] })
                    }
                  >
                    <span className="chat__toggle-knob" />
                    <span className="chat__toggle-state">
                      {settings[opt.key] ? "On" : "Off"}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
