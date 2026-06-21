import { useEffect, useState } from "react";
import AppHeader from "@/app/layout/AppHeader/AppHeader";
import {
  MetricCards,
  MetricBarChart,
  QuestionsTable,
} from "@/features/evaluation";
import type { Metric, QuestionRow } from "@/features/evaluation";
import { getEvals, runEvals, ApiError } from "@/shared/api/client";
import type { EvalResponse } from "@/shared/api/types";
import { EVAL_POLL_INTERVAL_MS, EVAL_POLL_MAX_ATTEMPTS } from "@/shared/constants";
import "./Evaluation.css";

const METRIC_LABELS: Record<string, string> = {
  faithfulness: "Faithfulness",
  answerRelevancy: "Answer relevancy",
  contextPrecision: "Context precision",
  contextRecall: "Context recall",
};

const METRIC_NOTES = [
  {
    label: "Faithfulness",
    note: "How well the answer sticks to the retrieved source text. High means the model is not making things up.",
  },
  {
    label: "Answer relevancy",
    note: "How directly the answer addresses the question that was actually asked, without padding or drift.",
  },
  {
    label: "Context precision",
    note: "How much of the retrieved context was actually relevant. High means retrieval pulled the right passages.",
  },
  {
    label: "Context recall",
    note: "How much of the information needed to answer was actually retrieved. Low means the right passages were missed.",
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const errMsg = (e: unknown) =>
  e instanceof ApiError ? e.message : "Couldn't reach the backend.";

function toMetrics(data: EvalResponse): Metric[] {
  return Object.entries(data.metrics).map(([key, value]) => ({
    label: METRIC_LABELS[key] ?? key,
    value,
    baseline: data.baseline?.[key],
  }));
}

function toRows(data: EvalResponse): QuestionRow[] {
  return data.questions.map((q) => ({
    question: q.question,
    faithfulness: q.faithfulness ?? NaN,
    relevancy: q.answerRelevancy ?? NaN,
    precision: q.contextPrecision ?? NaN,
    recall: q.contextRecall,
  }));
}

function Evaluation() {
  const [data, setData] = useState<EvalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getEvals()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(errMsg(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  async function handleRun() {
    setError(null);
    setRunning(true);
    try {
      await runEvals();
      // A real run is slow + throttled; poll until the background job clears.
      for (let i = 0; i < EVAL_POLL_MAX_ATTEMPTS; i++) {
        await sleep(EVAL_POLL_INTERVAL_MS);
        const d = await getEvals();
        if (d) setData(d);
        if (d && !d.running) break;
      }
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setRunning(false);
    }
  }

  const metrics = data ? toMetrics(data) : [];
  const rows = data ? toRows(data) : [];
  const badge = running
    ? { text: "Running…", cls: "eval__badge--running" }
    : data?.stale
    ? { text: "Stale — rerun", cls: "eval__badge--stale" }
    : data
    ? { text: "Live", cls: "eval__badge--live" }
    : null;

  return (
    <div className="eval-page">
      <AppHeader />
      <main className="eval">
        <div className="container">
          <div className="eval__head">
            <h1 className="eval__title">Evaluation</h1>
            <p className="eval__subtitle">
              How well FinQuery's answers hold up, measured with RAGAS across a
              set of test questions.
            </p>
            {badge && <span className={`eval__badge ${badge.cls}`}>{badge.text}</span>}
            <div className="eval__actions">
              <button
                className="btn btn-primary"
                onClick={handleRun}
                disabled={running}
              >
                {running ? "Running evaluation…" : data ? "Re-run" : "Run evaluation"}
              </button>
              {data && (
                <span className="eval__meta">
                  {data.questionCount} questions · run{" "}
                  {new Date(data.createdAt).toLocaleString()} ·{" "}
                  {String(data.config.model ?? "")} · topK{" "}
                  {String(data.config.topK ?? "")} · rerank{" "}
                  {data.config.reranker ? "on" : "off"} · hybrid{" "}
                  {data.config.hybrid ? "on" : "off"}
                </span>
              )}
            </div>
          </div>

          {error && <p className="eval__error">{error}</p>}

          {loading ? (
            <p className="eval__empty">Loading…</p>
          ) : !data ? (
            <p className="eval__empty">
              No evaluation yet. Click <strong>Run evaluation</strong> to score
              the test questions with RAGAS (this can take a few minutes on the
              free tier).
            </p>
          ) : (
            <>
              <section className="eval__section">
                <MetricCards metrics={metrics} />
              </section>

              <section className="eval__section">
                <h2 className="eval__section-title">Metrics at a glance</h2>
                <MetricBarChart metrics={metrics} />
              </section>

              <section className="eval__section">
                <h2 className="eval__section-title">What each metric means</h2>
                <div className="eval__notes">
                  {METRIC_NOTES.map((m) => (
                    <div className="eval__note" key={m.label}>
                      <h3 className="eval__note-label">{m.label}</h3>
                      <p className="eval__note-text">{m.note}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="eval__section">
                <h2 className="eval__section-title">Per-question scores</h2>
                <QuestionsTable rows={rows} />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Evaluation;
