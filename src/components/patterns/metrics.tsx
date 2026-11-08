import type { ReactNode, ComponentPropsWithRef } from "react";
export type DeltaDirection =
  | "positive"
  | "negative"
  | "neutral"
  | "unavailable";
export type DeltaValueProps = ComponentPropsWithRef<"span"> & {
  value?: ReactNode;
  percentage?: ReactNode;
  direction?: DeltaDirection;
  tone?: "neutral" | "success" | "danger";
  description?: ReactNode;
  missingValue?: ReactNode;
};
const directions = {
  positive: "Increase",
  negative: "Decrease",
  neutral: "No change",
  unavailable: "Change unavailable",
};
export function DeltaValue({
  value,
  percentage,
  direction = "unavailable",
  tone = "neutral",
  description,
  missingValue = "—",
  className = "",
  ...props
}: DeltaValueProps) {
  return (
    <span
      {...props}
      className={`ds-delta ${className}`}
      data-direction={direction}
      data-tone={tone}
    >
      <span className="ds-data-sr-only">{directions[direction]}: </span>
      <span className="ds-delta-value">
        {value ?? percentage ?? missingValue}
      </span>
      {value != null && percentage != null && (
        <span className="ds-delta-percentage"> ({percentage})</span>
      )}
      {description != null && description !== false && (
        <span className="ds-delta-description">{description}</span>
      )}
    </span>
  );
}
export type MetricProps = Omit<ComponentPropsWithRef<"article">, "title"> & {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  comparison?: ReactNode;
  status?: ReactNode;
  description?: ReactNode;
  prominent?: boolean;
  headingLevel?: 2 | 3 | 4;
  missingValue?: ReactNode;
};
export function Metric({
  label,
  value,
  unit,
  comparison,
  status,
  description,
  prominent = false,
  headingLevel = 3,
  missingValue = "—",
  className = "",
  ...props
}: MetricProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <article
      {...props}
      className={`ds-metric ${prominent ? "ds-metric--prominent" : ""} ${className}`}
    >
      <Heading>{label}</Heading>
      <div className="ds-metric-value">
        {value ?? missingValue}
        {unit != null && unit !== false && (
          <span className="ds-metric-unit">{unit}</span>
        )}
      </div>
      {comparison != null && comparison !== false && (
        <div className="ds-metric-comparison">{comparison}</div>
      )}
      {status != null && status !== false && (
        <div className="ds-metric-status">{status}</div>
      )}
      {description != null && description !== false && (
        <div className="ds-metric-description">{description}</div>
      )}
    </article>
  );
}
export function MetricGroup({
  density = "comfortable",
  className = "",
  ...props
}: ComponentPropsWithRef<"div"> & { density?: "comfortable" | "compact" }) {
  return (
    <div
      {...props}
      data-density={density}
      className={`ds-metric-group ${className}`}
    />
  );
}
