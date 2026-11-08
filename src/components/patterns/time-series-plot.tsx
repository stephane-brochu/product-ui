"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChartCanvas, type PlotSeries } from "./chart-primitives";
import { Disclosure } from "./disclosure";
import { Table, TableScrollRegion, NumericCell } from "../ui/table";
import { EmptyState, ErrorState, LoadingIndicator } from "../ui/feedback";

export type PlotPoint = {
  id?: string;
  date: string;
  values: Record<string, string | number | null>;
  status?: string;
  annotation?: string;
  dashed?: boolean;
};
type NormalizedPlotPoint = PlotPoint & { id: string };
export type ValueFormatter = (
  value: string | number | null | undefined,
) => string;
export function plotNumber(
  value: string | number | null | undefined,
): number | null {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && !value.trim())
  )
    return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
/** Presentation only: retain fractional digits and zeros; do not convert strings to floating point. */
export function groupPlotValue(
  value: string | number | null | undefined,
): string {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && !value.trim()) ||
    (typeof value === "number" && !Number.isFinite(value))
  )
    return "—";
  const [integer, fraction] = String(value).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}
function normalize(points: readonly PlotPoint[]): NormalizedPlotPoint[] {
  return points
    .flatMap((point, index) => {
      const date = new Date(`${point.date}T12:00:00Z`);
      return /^\d{4}-\d{2}-\d{2}$/.test(point.date) &&
        Number.isFinite(date.valueOf()) &&
        date.toISOString().slice(0, 10) === point.date
        ? [{ ...point, id: point.id ?? `${point.date}:${index}` }]
        : [];
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
const strokes = [
  "var(--ui-foreground)",
  "var(--ui-muted-foreground)",
  "var(--ui-primary)",
  "var(--ui-border-strong)",
];
export function PlotTooltip({
  point,
  series,
  formatValue,
  formatDate,
}: {
  point: PlotPoint;
  series: readonly PlotSeries[];
  formatValue: ValueFormatter;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="ds-chart-tooltip" role="status">
      <strong>{formatDate(point.date)}</strong>
      {series.map((item) => (
        <div key={item.id}>
          <span>{item.label}</span>
          <span>{formatValue(point.values[item.id])}</span>
        </div>
      ))}
      {point.status && <span>{point.status}</span>}
      {point.annotation && <p>{point.annotation}</p>}
    </div>
  );
}
export type TimeSeriesPlotProps = {
  title: string;
  unit?: string;
  points: readonly PlotPoint[];
  series: readonly PlotSeries[];
  kind?: "line" | "bar" | "stacked";
  height?: number;
  showAnnotations?: boolean;
  showDataTable?: boolean;
  tableHint?: boolean;
  formatValue?: ValueFormatter;
  formatDate?: (date: string) => string;
  formatAxis?: (value: number) => string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
};
export function TimeSeriesPlot(props: TimeSeriesPlotProps) {
  if (props.loading)
    return <LoadingIndicator label={`Loading ${props.title}`} />;
  if (props.error)
    return <ErrorState onRetry={props.onRetry}>{props.error}</ErrorState>;
  if (
    !props.loading &&
    !props.error &&
    (props.points.length > 2000 || props.series.length > 32)
  )
    return (
      <ErrorState title="Too much data for an interactive chart">
        Choose a smaller range or fewer series. The product can provide a full
        table or export.
      </ErrorState>
    );
  return <TimeSeriesPlotContent {...props} />;
}
function TimeSeriesPlotContent({
  title,
  unit = "",
  points: suppliedPoints,
  series: visible,
  kind = "line",
  height = 270,
  showAnnotations = true,
  showDataTable = true,
  tableHint = showDataTable,
  formatValue = groupPlotValue,
  formatDate = (date) => date,
  formatAxis = (value) =>
    new Intl.NumberFormat("en-CA", { maximumFractionDigits: 0 }).format(value),
}: TimeSeriesPlotProps) {
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const [activeIndex, setActive] = useState<number | null>(null),
    [hoverIndex, setHover] = useState<number | null>(null),
    [plotWidth, setPlotWidth] = useState(900);
  const container = useRef<HTMLDivElement>(null),
    uniqueId = useId();
  useEffect(() => {
    const node = container.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setPlotWidth(Math.max(280, Math.round(width)));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  if (!Number.isFinite(height) || height < 160 || height > 2000)
    throw new Error("Chart height must be at least 160");
  if (
    visible.some((item) => typeof item.id !== "string" || !item.id.trim()) ||
    new Set(visible.map((item) => item.id)).size !== visible.length
  )
    throw new Error("Chart series require unique nonempty IDs");
  const points = useMemo(() => normalize(suppliedPoints), [suppliedPoints]);
  if (
    points.some((point) => typeof point.id !== "string" || !point.id.trim()) ||
    new Set(points.map((point) => point.id)).size !== points.length
  )
    throw new Error("Chart points require unique IDs");
  const values = points
    .flatMap((point) =>
      visible.map((series) => plotNumber(point.values[series.id])),
    )
    .filter((value): value is number => value !== null);
  const scaleFactor = Math.max(1, ...values.map((value) => Math.abs(value)));
  const stacks =
    kind === "stacked"
      ? points.flatMap((point) => {
          const parts = visible
            .map((series) => plotNumber(point.values[series.id]))
            .filter((value): value is number => value !== null)
            .map((value) => value / scaleFactor);
          return [
            parts
              .filter((value) => value >= 0)
              .reduce((sum, value) => sum + value, 0),
            parts
              .filter((value) => value < 0)
              .reduce((sum, value) => sum + value, 0),
          ];
        })
      : values.map((value) => value / scaleFactor);
  const lower = Math.min(0, ...stacks),
    upper = Math.max(0, ...stacks),
    spread = upper - lower || 1;
  const left = plotWidth < 540 ? 65 : 92,
    right = plotWidth - 20,
    top = 24,
    bottom = height - 45;
  const startTime = Date.parse(`${points[0]?.date ?? "2000-01-01"}T12:00:00Z`),
    endTime = Date.parse(`${points.at(-1)?.date ?? "2000-01-01"}T12:00:00Z`);
  const x = (date: string) =>
    endTime === startTime
      ? (left + right) / 2
      : left +
        ((Date.parse(`${date}T12:00:00Z`) - startTime) /
          (endTime - startTime)) *
          (right - left);
  const yScaled = (value: number) =>
    bottom - ((value - lower) / spread) * (bottom - top);
  const y = (value: number) => yScaled(value / scaleFactor);
  const active =
    activeIndex === null
      ? null
      : points[Math.min(activeIndex, points.length - 1)];
  const hovered =
    hoverIndex === null
      ? null
      : points[Math.min(hoverIndex, points.length - 1)];
  const pointSummary = active
    ? `${formatDate(active.date)}. ${visible.map((series) => `${series.label}: ${formatValue(active.values[series.id])}`).join(". ")}. ${active.status ?? ""}.`
    : "Use arrow keys to explore chart values";
  const annotationsEnabled = showAnnotations;
  return (
    <div ref={container} className="ds-timeseries-plot">
      {points.length && visible.length && values.length ? (
        <div
          className="ds-chart-interaction"
          role="slider"
          aria-label={`${title} data exploration`}
          aria-valuemin={0}
          aria-valuemax={points.length - 1}
          aria-valuenow={
            activeIndex === null ? 0 : Math.min(activeIndex, points.length - 1)
          }
          aria-valuetext={pointSummary}
          tabIndex={0}
          onBlur={() => {
            setActive(null);
            setHover(null);
          }}
          onKeyDown={(event) => {
            if (
              [
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
              ].includes(event.key)
            ) {
              event.preventDefault();
              setHover(null);
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? points.length - 1
                    : Math.max(
                        0,
                        Math.min(
                          points.length - 1,
                          (activeIndex ?? keyboardIndex ?? 0) +
                            (["ArrowRight", "ArrowUp"].includes(event.key)
                              ? 1
                              : -1),
                        ),
                      );
              setActive(next);
              setKeyboardIndex(next);
            }
          }}
          onPointerMove={(event) => {
            if (event.pointerType === "touch" && !event.buttons) return;
            const graphicRect = event.currentTarget
              .querySelector("svg")
              ?.getBoundingClientRect();
            const rect = graphicRect?.width
              ? graphicRect
              : event.currentTarget.getBoundingClientRect();
            let hit: { index: number; distance: number } | null = null;
            points.forEach((point, index) => {
              let positiveHit = 0,
                negativeHit = 0;
              visible.forEach((series, seriesIndex) => {
                const value = plotNumber(point.values[series.id]);
                if (value === null) return;
                const pointX =
                  rect.left + (x(point.date) / plotWidth) * rect.width;
                const pointY = rect.top + (y(value) / height) * rect.height;
                let distance = Math.hypot(
                  event.clientX - pointX,
                  event.clientY - pointY,
                );
                if (kind !== "line") {
                  const groupWidth = Math.min(
                      46,
                      ((right - left) / Math.max(1, points.length)) * 0.65,
                    ),
                    barWidth =
                      kind === "stacked"
                        ? groupWidth
                        : groupWidth / visible.length;
                  const barX =
                    x(point.date) -
                    groupWidth / 2 +
                    (kind === "stacked" ? 0 : seriesIndex * barWidth);
                  const normalized = value / scaleFactor,
                    base =
                      kind === "stacked"
                        ? value >= 0
                          ? positiveHit
                          : negativeHit
                        : 0;
                  if (value >= 0) positiveHit += normalized;
                  else negativeHit += normalized;
                  const screenLeft =
                      rect.left + (barX / plotWidth) * rect.width,
                    screenRight =
                      screenLeft +
                      (Math.max(2, barWidth - 1) / plotWidth) * rect.width;
                  const screenTop =
                    rect.top +
                    (Math.min(yScaled(base), yScaled(base + normalized)) /
                      height) *
                      rect.height;
                  const screenBottom =
                    screenTop +
                    (Math.max(
                      1,
                      Math.abs(yScaled(base) - yScaled(base + normalized)),
                    ) /
                      height) *
                      rect.height;
                  distance = Math.hypot(
                    Math.max(
                      screenLeft - event.clientX,
                      0,
                      event.clientX - screenRight,
                    ),
                    Math.max(
                      screenTop - event.clientY,
                      0,
                      event.clientY - screenBottom,
                    ),
                  );
                }
                if (distance <= 12 && (!hit || distance < hit.distance)) {
                  hit = { index, distance };
                }
              });
            });
            const index = hit ? (hit as { index: number }).index : null;
            setHover(index);
            setActive(index);
          }}
          onPointerLeave={() => {
            setHover(null);
            setActive(null);
          }}
          onPointerDown={(event) => {
            if (event.pointerType !== "touch") return;
            const graphicRect = event.currentTarget
              .querySelector("svg")
              ?.getBoundingClientRect();
            const rect = graphicRect?.width
              ? graphicRect
              : event.currentTarget.getBoundingClientRect();
            const target =
              ((event.clientX - rect.left) / rect.width) * plotWidth;
            setActive(
              points.reduce(
                (best, point, index) =>
                  Math.abs(x(point.date) - target) <
                  Math.abs(x(points[best].date) - target)
                    ? index
                    : best,
                0,
              ),
            );
            setHover(
              points.reduce(
                (best, point, index) =>
                  Math.abs(x(point.date) - target) <
                  Math.abs(x(points[best].date) - target)
                    ? index
                    : best,
                0,
              ),
            );
          }}
        >
          <ChartCanvas
            width={plotWidth}
            height={height}
            label={`${title}. ${unit}. ${points.length} dates. Use the keyboard explorer${tableHint ? " or data table" : ""} for exact values.`}
          >
            <defs>
              <pattern
                id={`${uniqueId}-hatch`}
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M-1 1L1-1M0 6L6 0M5 7L7 5"
                  stroke="var(--ui-foreground)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            {[0, 0.5, 1].map((fraction) => {
              const normalizedTick = lower + fraction * spread;
              const value = normalizedTick * scaleFactor;
              return (
                <g key={fraction}>
                  <line
                    x1={left}
                    x2={right}
                    y1={yScaled(normalizedTick)}
                    y2={yScaled(normalizedTick)}
                    className="ds-chart-grid"
                  />
                  <text
                    x={left - 12}
                    y={yScaled(normalizedTick) + 4}
                    textAnchor="end"
                    className="ds-chart-axis"
                  >
                    {Number.isFinite(value)
                      ? unit === "%"
                        ? `${formatAxis(value)}%`
                        : formatAxis(value)
                      : "Beyond numeric range"}
                  </text>
                </g>
              );
            })}
            {kind === "line"
              ? visible.map((series, seriesIndex) => (
                  <g
                    key={series.id}
                    stroke={strokes[seriesIndex % strokes.length]}
                    fill="none"
                    strokeWidth="2.25"
                  >
                    {points.map((point, index) => {
                      const value = plotNumber(point.values[series.id]),
                        previous = points[index - 1],
                        previousValue = previous
                          ? plotNumber(previous.values[series.id])
                          : null;
                      const estimated =
                        point.dashed || previous?.dashed || series.dashed;
                      return value === null ? null : (
                        <g key={point.id}>
                          {previous && previousValue !== null && (
                            <line
                              x1={x(previous.date)}
                              y1={y(previousValue)}
                              x2={x(point.date)}
                              y2={y(value)}
                              strokeDasharray={
                                estimated ||
                                series.pattern === "dashed" ||
                                (!series.pattern && seriesIndex % 2)
                                  ? "6 5"
                                  : series.pattern === "dotted"
                                    ? "2 4"
                                    : undefined
                              }
                            />
                          )}
                          {seriesIndex % 2 ? (
                            <rect
                              x={x(point.date) - 2.5}
                              y={y(value) - 2.5}
                              width="5"
                              height="5"
                              fill={strokes[seriesIndex % strokes.length]}
                              stroke="none"
                            />
                          ) : (
                            <circle
                              cx={x(point.date)}
                              cy={y(value)}
                              r={2.75}
                              fill="var(--ui-background)"
                            />
                          )}
                        </g>
                      );
                    })}
                  </g>
                ))
              : points.map((point) => {
                  let positive = 0,
                    negative = 0;
                  const groupWidth = Math.min(
                    46,
                    ((right - left) / Math.max(1, points.length)) * 0.65,
                  );
                  return (
                    <g key={point.id}>
                      {visible.map((series, index) => {
                        const value = plotNumber(point.values[series.id]);
                        if (value === null) return null;
                        const base =
                          kind === "stacked"
                            ? value >= 0
                              ? positive
                              : negative
                            : 0;
                        if (value >= 0) positive += value / scaleFactor;
                        else negative += value / scaleFactor;
                        const width =
                          kind === "stacked"
                            ? groupWidth
                            : groupWidth / visible.length;
                        const barX =
                          kind === "stacked"
                            ? x(point.date) - groupWidth / 2
                            : x(point.date) - groupWidth / 2 + index * width;
                        return (
                          <rect
                            key={series.id}
                            x={barX}
                            y={Math.min(
                              yScaled(base),
                              yScaled(base + value / scaleFactor),
                            )}
                            width={Math.max(2, width - 1)}
                            height={Math.max(
                              1,
                              Math.abs(
                                yScaled(base) -
                                  yScaled(base + value / scaleFactor),
                              ),
                            )}
                            fill={
                              index % 2
                                ? `url(#${uniqueId}-hatch)`
                                : "var(--ui-foreground)"
                            }
                            stroke="var(--ui-foreground)"
                            strokeWidth=".7"
                          />
                        );
                      })}
                    </g>
                  );
                })}
            {points
              .filter((point) =>
                visible.some(
                  (series) => plotNumber(point.values[series.id]) === null,
                ),
              )
              .map((point) => (
                <text
                  key={`missing-${point.id}`}
                  x={x(point.date)}
                  y={14}
                  textAnchor="middle"
                  className="ds-chart-axis"
                >
                  —
                </text>
              ))}
            {showAnnotations &&
              annotationsEnabled &&
              points
                .filter((point) => point.annotation)
                .map((point) => (
                  <g key={point.id}>
                    <line
                      x1={x(point.date)}
                      x2={x(point.date)}
                      y1={top}
                      y2={bottom}
                      stroke="var(--ui-border-strong)"
                      strokeDasharray="2 5"
                    />
                    <text
                      x={x(point.date)}
                      y={14}
                      textAnchor="middle"
                      className="ds-chart-axis"
                    >
                      ◇
                    </text>
                  </g>
                ))}
            {active && (
              <line
                className="ds-chart-crosshair"
                x1={x(active.date)}
                x2={x(active.date)}
                y1={top}
                y2={bottom}
              />
            )}
            {[
              points[0],
              plotWidth < 540
                ? undefined
                : points[Math.floor((points.length - 1) / 2)],
              points.at(-1),
            ]
              .filter(
                (point, index, list): point is NormalizedPlotPoint =>
                  !!point &&
                  list.findIndex((other) => other?.date === point.date) ===
                    index,
              )
              .map((point) => (
                <text
                  key={point.id}
                  x={x(point.date)}
                  y={height - 18}
                  textAnchor={
                    point === points[0]
                      ? "start"
                      : point === points.at(-1)
                        ? "end"
                        : "middle"
                  }
                  className="ds-chart-axis"
                >
                  {formatDate(point.date)}
                </text>
              ))}
          </ChartCanvas>
          {hovered && (
            <PlotTooltip
              point={hovered}
              series={visible}
              formatValue={formatValue}
              formatDate={formatDate}
            />
          )}
        </div>
      ) : (
        <EmptyState title="No data in this view">
          Missing data is never treated as zero.
        </EmptyState>
      )}
      {keyboardIndex !== null && points.length > 0 && (
        <p className="ds-chart-keyboard-summary" role="status">
          Keyboard selection:{" "}
          {formatDate(points[Math.min(keyboardIndex, points.length - 1)].date)}.{" "}
          {visible
            .map(
              (series) =>
                `${series.label}: ${formatValue(points[Math.min(keyboardIndex, points.length - 1)].values[series.id])}`,
            )
            .join(". ")}
        </p>
      )}
      {showDataTable && (
        <Disclosure title="View accessible chart data">
          <TableScrollRegion label={`${title} data, scroll if needed`}>
            <Table caption={`${title}${unit ? ` · ${unit}` : ""}`}>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  {visible.map((series) => (
                    <th key={series.id} scope="col">
                      {series.label}
                    </th>
                  ))}
                  <th scope="col">Status / annotation</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point) => (
                  <tr key={point.id}>
                    <th scope="row">{formatDate(point.date)}</th>
                    {visible.map((series) => (
                      <NumericCell key={series.id}>
                        {formatValue(point.values[series.id])}
                      </NumericCell>
                    ))}
                    <td>
                      {[point.status, point.annotation]
                        .filter(Boolean)
                        .join(" · ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScrollRegion>
        </Disclosure>
      )}
    </div>
  );
}
