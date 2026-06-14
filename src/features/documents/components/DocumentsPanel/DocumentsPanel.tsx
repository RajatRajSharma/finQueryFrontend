import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { DocItem } from "../../types";
import "./DocumentsPanel.css";

interface Props {
  docs: DocItem[];
  onUpload: (files: FileList) => void;
}

function DocumentsPanel({ docs, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) onUpload(e.dataTransfer.files);
  }

  return (
    <aside className="docs">
      <h2 className="docs__title">Documents</h2>

      <div
        className={`docs__dropzone${dragging ? " docs__dropzone--active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <span className="docs__dropzone-icon">⬆</span>
        <span className="docs__dropzone-text">
          <strong>Upload PDF</strong>
          <br />
          or drag &amp; drop here
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) onUpload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {docs.length === 0 ? (
        <p className="docs__empty">No reports uploaded yet.</p>
      ) : (
        <ul className="docs__list">
          {docs.map((doc) => (
            <li className="docs__item" key={doc.id}>
              <span className="docs__file-icon">📄</span>
              <span className="docs__file-name" title={doc.name}>
                {doc.name}
              </span>
              {doc.status === "processing" ? (
                <span className="docs__spinner" aria-label="Processing" />
              ) : (
                <span className="docs__check" aria-label="Ready">
                  ✓
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/app/evaluation"
        className="docs__eval-link"
        title="Open the evaluation dashboard"
      >
        📊 Eval dashboard
      </Link>
    </aside>
  );
}

export default DocumentsPanel;
