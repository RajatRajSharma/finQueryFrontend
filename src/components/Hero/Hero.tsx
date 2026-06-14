import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__text">
          <h1 className="hero__headline">
            Chat with annual reports,
            <br />
            get cited answers.
          </h1>
          <p className="hero__subhead">
            Ask a question in plain English and get an answer grounded in the
            actual annual report, with the exact document and page it came from.
            No more reading 200 pages.
          </p>
          <div className="hero__actions">
            <Link to="/app" className="btn btn-primary">
              Try it now
            </Link>
            <a href="#how" className="btn btn-outline">
              See how it works
            </a>
          </div>
        </div>

        {/* small static mockup of a question + cited answer */}
        <div className="hero__mockup" aria-hidden="true">
          <div className="hero__bubble hero__bubble--user">
            What was Apple's revenue last year?
          </div>
          <div className="hero__bubble hero__bubble--answer">
            Apple reported total net sales of{" "}
            <strong>$391.0&nbsp;billion</strong> for fiscal 2024.
            <div className="hero__cite">📄 apple-10k.pdf · p.&nbsp;31</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
