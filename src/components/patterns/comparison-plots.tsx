"use client";
import { useId, type ReactNode } from "react";
import { ChartFrame, ChartHeader, ChartCanvas } from "./chart-primitives";
export function WaterfallPlot({
  title,
  steps,
  description,
}: {
  title: string;
  steps: {
    label: string;
    start: number;
    end: number;
    value: string;
    total?: boolean;
  }[];
  description?: string;
}) {
  if (steps.length > 24) throw new Error("Waterfalls support at most 24 steps");
  if (
    steps.some(
      (step) => !Number.isFinite(step.start) || !Number.isFinite(step.end),
    )
  )
    throw new Error("Waterfall coordinates must be finite");
  const low = Math.min(0, ...steps.flatMap((step) => [step.start, step.end])),
    high = Math.max(1, ...steps.flatMap((step) => [step.start, step.end]));
  if (!Number.isFinite(high - low) || steps.length > 24)
    throw new Error(
      "Waterfalls support at most 24 steps with a finite coordinate span",
    );
  const y = (value: number) => 190 - ((value - low) / (high - low)) * 160;
  const width = 720 / Math.max(1, steps.length);
  return (
    <ChartFrame label={title}>
      <ChartHeader title={title} description={description} />
      <div
        className="ds-wide-chart"
        role="region"
        aria-label={`${title} chart, scroll horizontally on small screens`}
        tabIndex={0}
      >
        <ChartCanvas
          label={`${title}. A text equivalent follows.`}
          height={250}
        >
          <line
            x1={75}
            x2={850}
            y1={y(0)}
            y2={y(0)}
            className="ds-chart-grid"
          />
          {steps.map((step, index) => {
            const x = 105 + index * width;
            return (
              <g key={`${index}:${step.label}`}>
                {index > 0 && (
                  <line
                    x1={x - width + 50}
                    x2={x}
                    y1={y(step.start)}
                    y2={y(step.start)}
                    stroke="var(--ui-border-strong)"
                    strokeDasharray="3 3"
                  />
                )}
                <rect
                  x={x}
                  y={Math.min(y(step.start), y(step.end))}
                  width={Math.min(56, width * 0.6)}
                  height={Math.max(2, Math.abs(y(step.start) - y(step.end)))}
                  fill={step.total ? "var(--ui-foreground)" : "var(--ui-muted)"}
                  stroke="var(--ui-foreground)"
                />
                <text
                  x={x + 24}
                  y={218}
                  textAnchor="middle"
                  className="ds-chart-axis"
                >
                  {step.label}
                </text>
                <text
                  x={x + 24}
                  y={Math.max(18, Math.min(y(step.start), y(step.end)) - 9)}
                  textAnchor="middle"
                  className="ds-chart-axis"
                >
                  {step.value}
                </text>
              </g>
            );
          })}
        </ChartCanvas>
      </div>
      <dl className="ds-waterfall-data">
        {steps.map((step, index) => (
          <div key={`${index}:${step.label}`}>
            <dt>{step.label}</dt>
            <dd>{step.value}</dd>
          </div>
        ))}
      </dl>
    </ChartFrame>
  );
}

export function ComparisonBars({
  items,
  label = "Comparison",
}: {
  label?: string;
  items: readonly {
    id: string;
    label: ReactNode;
    value: ReactNode;
    fraction: number;
  }[];
}) {
  return (
    <ol className="ds-allocation" aria-label={label}>
      {items.map((item) => (
        <li key={item.id}>
          <div>
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div className="ds-allocation-track" aria-hidden="true">
            <span
              style={{
                width: `${Math.max(0, Math.min(1, Number.isFinite(item.fraction) ? item.fraction : 0)) * 100}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
export function RelationshipFlow({
  items,
  label = "Relationships",
}: {
  label?: string;
  items: readonly {
    id: string;
    from: ReactNode;
    to: ReactNode;
    value: ReactNode;
    detail?: ReactNode;
  }[];
}) {
  return (
    <ul className="ds-transfer-flow" aria-label={label}>
      {items.map((item) => (
        <li key={item.id}>
          <span>{item.from}</span>
          <span className="ds-flow-link">
            <strong>{item.value}</strong>
            <span aria-hidden="true">⟶</span>
            <span>{item.detail}</span>
          </span>
          <span>{item.to}</span>
        </li>
      ))}
    </ul>
  );
}
export function Sparkline({
  values,
  label,
}: {
  values: readonly (number | null)[];
  label: string;
}) {
  const id = useId();
  if (values.length > 2000)
    throw new Error("Sparklines support at most 2000 values");
  const numbers = values.filter(
    (value): value is number => value !== null && Number.isFinite(value),
  );
  const scale = Math.max(1, ...numbers.map((value) => Math.abs(value))),
    normalized = numbers.map((value) => value / scale);
  const min = normalized.length ? Math.min(...normalized) : 0,
    span = normalized.length ? Math.max(...normalized) - min || 1 : 1;
  const x = (index: number) =>
    (index / Math.max(1, values.length - 1)) * 116 + 2;
  const y = (value: number) => 31 - ((value / scale - min) / span) * 27;
  return (
    <svg
      className="ds-sparkline"
      viewBox="0 0 120 35"
      role="img"
      aria-label={label}
      aria-describedby={id}
    >
      <desc id={id}>
        {values
          .map((value) =>
            value !== null && Number.isFinite(value)
              ? String(value)
              : "missing",
          )
          .join(", ") || "No data"}
      </desc>
      {values.map((value, index) => {
        const previous = values[index - 1];
        return value === null || !Number.isFinite(value) ? null : (
          <g key={index}>
            {index > 0 && previous != null && Number.isFinite(previous) && (
              <line
                x1={x(index - 1)}
                x2={x(index)}
                y1={y(previous)}
                y2={y(value)}
                stroke="currentColor"
                strokeWidth="1.5"
              />
            )}
            <circle
              cx={values.length === 1 ? 60 : x(index)}
              cy={y(value)}
              r="1.5"
              fill="currentColor"
            />
          </g>
        );
      })}
    </svg>
  );
}
