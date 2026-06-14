import "./ValueCards.css";

const cards = [
  {
    title: "Skip the 200 page read",
    text: "Instead of scrolling through a whole annual report for one number, you ask exactly what you want and get the answer back in seconds.",
  },
  {
    title: "Answers with sources",
    text: "Every answer points to the exact document and page it came from, so you can open the source and confirm it yourself rather than wonder if it was made up.",
  },
  {
    title: "Compare companies instantly",
    text: "Upload several reports at once and ask across all of them together, lining up revenue, margins and risks from different companies side by side.",
  },
];

function ValueCards() {
  return (
    <section id="value" className="section value">
      <div className="container">
        <h2 className="section-title">What it solves</h2>
        <p className="section-subtitle">
          Annual reports are long and dense. FinQuery turns them into a
          conversation.
        </p>

        <div className="value__grid">
          {cards.map((card) => (
            <article className="value__card" key={card.title}>
              <h3 className="value__card-title">{card.title}</h3>
              <p className="value__card-text">{card.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ValueCards;
