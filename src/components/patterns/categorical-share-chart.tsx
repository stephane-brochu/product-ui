import type { CSSProperties, ReactNode } from "react";

export type CategoricalShare = {
  id: string;
  label: ReactNode;
  value: number;
  valueLabel: ReactNode;
  color?: string;
};

const fallbackColors = [
  "var(--ui-primary)",
  "var(--ui-foreground)",
  "var(--ui-muted-foreground)",
  "var(--ui-border-strong)",
];

export function CategoricalShareChart({
  items,
  label,
  totalLabel,
  emptyMessage = "No values to display.",
  className = "",
}: {
  items: readonly CategoricalShare[];
  label: string;
  totalLabel: ReactNode;
  emptyMessage?: ReactNode;
  className?: string;
}) {
  const visible = items.filter((item) => item.value > 0);
  if (items.some((item) => !Number.isFinite(item.value) || item.value < 0))
    throw new RangeError("CategoricalShareChart values must be finite and non-negative");
  if (new Set(items.map((item) => item.id)).size !== items.length)
    throw new Error("CategoricalShareChart item IDs must be unique");
  const total = visible.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const stops = visible.map((item, index) => {
    const start = cursor;
    cursor += (item.value / total) * 100;
    return `${item.color ?? fallbackColors[index % fallbackColors.length]} ${start}% ${cursor}%`;
  });

  return (
    <figure className={`ds-share-chart ${className}`}>
      <div
        className="ds-share-chart-plot"
        role="img"
        aria-label={label}
        style={{
          "--share-background": total
            ? `conic-gradient(${stops.join(", ")})`
            : "var(--ui-muted)",
        } as CSSProperties}
      />
      <figcaption>
        <strong className="ds-share-chart-total">{totalLabel}</strong>
        {visible.length ? (
          <ul className="ds-share-chart-legend">
            {visible.map((item, index) => (
              <li key={item.id}>
                <span
                  className="ds-share-chart-swatch"
                  aria-hidden="true"
                  style={{ backgroundColor: item.color ?? fallbackColors[index % fallbackColors.length] }}
                />
                <span>{item.label}</span>
                <strong>{item.valueLabel}</strong>
              </li>
            ))}
          </ul>
        ) : <p>{emptyMessage}</p>}
      </figcaption>
    </figure>
  );
}
