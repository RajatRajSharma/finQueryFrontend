import "./QuestionsTable.css";

export interface QuestionRow {
  question: string;
  faithfulness: number;
  relevancy: number;
  precision: number;
}

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
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.question}>
              <td className="qtable__q">{r.question}</td>
              <td>{r.faithfulness.toFixed(2)}</td>
              <td>{r.relevancy.toFixed(2)}</td>
              <td>{r.precision.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QuestionsTable;
