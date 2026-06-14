import "./HowItHelps.css";
import uploadGif from "@/assets/gif-upload-document.gif";
import askGif from "@/assets/gif-ask-qn.gif";
import doneGif from "@/assets/gif-task-done.gif";

const steps = [
  {
    step: "Step 1",
    title: "Upload a report",
    desc: "Drop in any company's 10-K PDF. FinQuery reads it, splits it into passages, and indexes it so it's ready to answer questions.",
    gif: uploadGif,
  },
  {
    step: "Step 2",
    title: "Ask a question",
    desc: 'Type what you want to know in plain English — "What were the main risk factors?" — and FinQuery retrieves the most relevant passages.',
    gif: askGif,
  },
  {
    step: "Step 3",
    title: "Get a cited answer",
    desc: "The answer streams in token by token, with citation chips underneath pointing to the exact document and page it came from.",
    gif: doneGif,
  },
];

function HowItHelps() {
  return (
    <section id="how" className="section how">
      <div className="container">
        <h2 className="section-title">How it works</h2>
        <p className="section-subtitle">Three steps, start to cited answer.</p>

        {steps.map((s, i) => (
          <div
            className={`how__row${i % 2 === 1 ? " how__row--reverse" : ""}`}
            key={s.step}
          >
            <div className="how__text">
              <span className="how__step">{s.step}</span>
              <h3 className="how__title">{s.title}</h3>
              <p className="how__desc">{s.desc}</p>
            </div>
            <div className="how__visual">
              <img className="how__media" src={s.gif} alt="" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItHelps;
