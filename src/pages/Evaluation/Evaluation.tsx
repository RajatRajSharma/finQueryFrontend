import AppHeader from "../../components/AppHeader/AppHeader";
import MetricCards from "../../components/MetricCards/MetricCards";
import type { Metric } from "../../components/MetricCards/MetricCards";
import MetricBarChart from "../../components/MetricBarChart/MetricBarChart";
import QuestionsTable from "../../components/QuestionsTable/QuestionsTable";
import type { QuestionRow } from "../../components/QuestionsTable/QuestionsTable";
import "./Evaluation.css";

// Demo RAGAS scores — replace with real values once the eval pipeline is wired.
const METRICS: Metric[] = [
  { label: "Faithfulness", value: 0.94 },
  { label: "Answer relevancy", value: 0.91 },
  { label: "Context precision", value: 0.88 },
];

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
];

const QUESTIONS: QuestionRow[] = [
  {
    question: "What was Apple's total revenue?",
    faithfulness: 0.97,
    relevancy: 0.93,
    precision: 0.9,
  },
  {
    question: "What are Tesla's main risk factors?",
    faithfulness: 0.92,
    relevancy: 0.9,
    precision: 0.86,
  },
  {
    question: "How did R&D spending change year over year?",
    faithfulness: 0.95,
    relevancy: 0.89,
    precision: 0.88,
  },
  {
    question: "Compare operating margins across companies",
    faithfulness: 0.91,
    relevancy: 0.92,
    precision: 0.87,
  },
];

function Evaluation() {
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
            <span className="eval__badge">Demo data</span>
          </div>

          <section className="eval__section">
            <MetricCards metrics={METRICS} />
          </section>

          <section className="eval__section">
            <h2 className="eval__section-title">Metrics at a glance</h2>
            <MetricBarChart metrics={METRICS} />
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
            <QuestionsTable rows={QUESTIONS} />
          </section>
        </div>
      </main>
    </div>
  );
}

export default Evaluation;
