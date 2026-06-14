import { Link } from "react-router-dom";
import "./UseCases.css";

// Each chip opens the app with the question pre-filled via a query param.
const examples = [
  "What was Apple's revenue last year?",
  "What are Tesla's main risk factors?",
  "Compare operating margins across these companies",
  "Summarize the company's growth strategy",
  "How much did R&D spending change year over year?",
];

function UseCases() {
  return (
    <section id="use-cases" className="section use-cases">
      <div className="container">
        <h2 className="section-title">Try a question</h2>
        <p className="section-subtitle">
          Pick one and we'll open the app with it pre-filled and ready to run.
        </p>

        <div className="use-cases__chips">
          {examples.map((q) => (
            <Link
              className="use-cases__chip"
              key={q}
              to={`/app?q=${encodeURIComponent(q)}`}
            >
              {q}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UseCases;
