import "./MetricCards.css";

export interface Metric {
  label: string;
  value: number;
  baseline?: number; // optional reference value for a before/after delta
}

function MetricCards({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="metric-cards">
      {metrics.map((m) => {
        const delta =
          typeof m.baseline === "number" ? m.value - m.baseline : null;
        return (
          <div className="metric-card" key={m.label}>
            <div className="metric-card__value">{m.value.toFixed(2)}</div>
            <div className="metric-card__label">{m.label}</div>
            {delta !== null ? (
              <div
                className={`metric-card__delta metric-card__delta--${
                  delta >= 0 ? "up" : "down"
                }`}
              >
                {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(2)} vs baseline
              </div>
            ) : (
              <div className="metric-card__scale">out of 1.00</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MetricCards;
