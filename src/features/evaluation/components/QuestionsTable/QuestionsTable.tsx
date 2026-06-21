import "./QuestionsTable.css";

export interface QuestionRow {
  question: string;
  faithfulness: number;
  relevancy: number;
  precision: number;
  recall?: number; // context recall (optional — older runs may not have it)
}

const fmt = (v: number | undefined) =>
  typeof v === "number" && !Number.isNaN(v) ? v.toFixed(2) : "—";

function QuestionsTable({ rows }: { rows: QuestionRow[] }) {
  return (
    <div className="qtable-wrap">
      <table className="qtable">
        <thead>
          <tr>
            <th>Test question</th>
            <th>Faithfulness</th>
            <th>Answer relevancy</th>
            <th>Context precision</th>
            <th>Context recall</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.question}>
              <td className="qtable__q">{r.question}</td>
              <td>{fmt(r.faithfulness)}</td>
              <td>{fmt(r.relevancy)}</td>
              <td>{fmt(r.precision)}</td>
              <td>{fmt(r.recall)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QuestionsTable;
