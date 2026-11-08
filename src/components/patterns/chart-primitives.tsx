"use client";
import {
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
  type ComponentPropsWithRef,
} from "react";
export type PlotSeries = {
  id: string;
  label: string;
  pattern?: "solid" | "dashed" | "dotted";
  dashed?: boolean;
};
export function ChartFooter({ children }: { children: ReactNode }) {
  return <footer className="ds-chart-footer">{children}</footer>;
}
export function ChartEventList({
  items,
  label = "Chart events",
}: {
  label?: string;
  items: readonly {
    id: string;
    label: ReactNode;
    dateLabel: ReactNode;
    dateTime?: string;
  }[];
}) {
  return items.length ? (
    <ul className="ds-chart-annotations" aria-label={label}>
      {items.map((item) => (
        <li key={item.id}>
          <span aria-hidden="true">◇ </span>
          <time dateTime={item.dateTime}>{item.dateLabel}</time> · {item.label}
        </li>
      ))}
    </ul>
  ) : null;
}
export function ChartFrame({
  children,
  label,
  className = "",
  ...props
}: ComponentPropsWithRef<"section"> & {
  label: string;
}) {
  return (
    <section {...props} className={`ds-chart ${className}`} aria-label={label}>
      {children}
    </section>
  );
}
export function ChartHeader({
  title,
  description,
  action,
  headingLevel = 3,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <header className="ds-chart-header">
      <div>
        <Heading>{title}</Heading>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  );
}
export function ChartToolbar({ children }: { children: ReactNode }) {
  return <div className="ds-chart-toolbar">{children}</div>;
}
export function ChartCanvas({
  children,
  label,
  height = 270,
  width = 900,
}: {
  children: ReactNode;
  label: string;
  height?: number;
  width?: number;
}) {
  return (
    <svg
      className="ds-chart-canvas"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
    >
      {children}
    </svg>
  );
}
const strokes = [
  "var(--ui-foreground)",
  "var(--ui-muted-foreground)",
  "var(--ui-primary)",
  "var(--ui-border-strong)",
];
export function ChartLegend({
  series,
  hidden,
  onToggle,
  compact = false,
}: {
  series: PlotSeries[];
  hidden: string[];
  onToggle: (id: string) => void;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return (
    <div
      className={`ds-chart-series${compact ? " ds-chart-series--compact" : ""}`}
    >
      {compact && (
        <button
          className="ds-chart-series-toggle ds-button ds-button--secondary"
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(!expanded)}
        >
          Series · {series.filter((item) => !hidden.includes(item.id)).length}/
          {series.length}
          <span aria-hidden="true"> {expanded ? "−" : "+"}</span>
        </button>
      )}
      <div
        id={id}
        data-expanded={expanded}
        className="ds-chart-legend"
        role="group"
        aria-label="Chart series visibility"
      >
        {series.map((item, index) => (
          <button
            type="button"
            key={item.id}
            onClick={() => onToggle(item.id)}
            aria-label={`${item.label} ${hidden.includes(item.id) ? "Hidden" : "Shown"}`}
            aria-pressed={!hidden.includes(item.id)}
            disabled={
              !hidden.includes(item.id) &&
              series.filter((item) => !hidden.includes(item.id)).length === 1
            }
            title={
              !hidden.includes(item.id) &&
              series.filter((item) => !hidden.includes(item.id)).length === 1
                ? "Keep at least one series visible"
                : `Toggle ${item.label}`
            }
          >
            <span
              className={`ds-legend-line ds-legend-line--${item.pattern ?? (index % 2 ? "dashed" : "solid")}`}
              style={
                {
                  "--series-stroke": strokes[index % strokes.length],
                } as CSSProperties
              }
              aria-hidden="true"
            />
            {item.label}
            <span className="ds-caption ds-legend-state">
              {hidden.includes(item.id) ? "Hidden" : "Shown"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
