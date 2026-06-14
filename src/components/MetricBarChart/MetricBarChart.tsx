import type { Metric } from "../MetricCards/MetricCards";
import "./MetricBarChart.css";

function MetricBarChart({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="barchart">
      {metrics.map((m) => (
        <div className="barchart__row" key={m.label}>
          <span className="barchart__label">{m.label}</span>
          <div className="barchart__track">
            <div
              className="barchart__fill"
              style={{ width: `${m.value * 100}%` }}
            >
              <span className="barchart__value">{m.value.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MetricBarChart;
