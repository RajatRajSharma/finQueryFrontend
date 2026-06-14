import "./MetricCards.css";

export interface Metric {
  label: string;
  value: number;
}

function MetricCards({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="metric-cards">
      {metrics.map((m) => (
        <div className="metric-card" key={m.label}>
          <div className="metric-card__value">{m.value.toFixed(2)}</div>
          <div className="metric-card__label">{m.label}</div>
          <div className="metric-card__scale">out of 1.00</div>
        </div>
      ))}
    </div>
  );
}

export default MetricCards;
