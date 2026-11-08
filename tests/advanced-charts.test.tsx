import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChartLegend } from "../src/components/patterns/chart-primitives";
import {
  TimeSeriesPlot,
  groupPlotValue,
} from "../src/components/patterns/time-series-plot";
import {
  Sparkline,
  ComparisonBars,
  WaterfallPlot,
  RelationshipFlow,
} from "../src/components/patterns/comparison-plots";
const series = [
  { id: "one", label: "Requests" },
  { id: "two", label: "Completed", pattern: "dashed" as const },
];
const points = [
  { date: "2026-01-31", values: { one: "1234.5600", two: "0.0000" } },
  { date: "2026-02-28", values: { one: null, two: "-0.0010" } },
  {
    date: "2026-03-31",
    values: { one: "9007199254740993.1234", two: "9007199254740993.1233" },
    annotation: "Supplied event",
    dashed: true,
  },
];
it("keeps exact grouped values and missing/zero semantics in keyboard summaries and its table", async () => {
  render(<TimeSeriesPlot title="Work" series={series} points={points} />);
  const explorer = screen.getByRole("slider", {
    name: "Work data exploration",
  });
  fireEvent.keyDown(explorer, { key: "End" });
  expect(explorer).toHaveAttribute(
    "aria-valuetext",
    expect.stringContaining("9,007,199,254,740,993.1234"),
  );
  expect(explorer).toHaveAttribute(
    "aria-valuetext",
    expect.stringContaining("9,007,199,254,740,993.1233"),
  );
  await userEvent.click(screen.getByText("View accessible chart data"));
  const rows = within(screen.getByRole("table")).getAllByRole("row");
  expect(rows[1]).toHaveTextContent("1,234.5600");
  expect(rows[1]).toHaveTextContent("0.0000");
  expect(rows[2]).toHaveTextContent("—");
  expect(rows[2]).toHaveTextContent("-0.0010");
});
it("sorts valid dates without mutating inputs and supports duplicate dates with distinct identities", () => {
  const data = [
    { id: "later", date: "2026-02-01", values: { one: "2" } },
    { id: "first", date: "2026-01-01", values: { one: "1" } },
    { id: "second", date: "2026-01-01", values: { one: "1.1" } },
    { date: "2026-02-31", values: { one: "7" } },
  ];
  render(
    <TimeSeriesPlot title="Dates" points={data} series={series.slice(0, 1)} />,
  );
  const explorer = screen.getByRole("slider");
  fireEvent.keyDown(explorer, { key: "Home" });
  expect(explorer).toHaveAttribute(
    "aria-valuetext",
    expect.stringContaining("2026-01-01. Requests: 1."),
  );
  expect(data[0].date).toBe("2026-02-01");
  expect(explorer).toHaveAttribute("aria-valuemax", "2");
});
it.each(["line", "bar", "stacked"] as const)(
  "renders %s finite coordinates for zero/negative/extreme numeric inputs",
  (kind) => {
    const { container } = render(
      <TimeSeriesPlot
        title="Extremes"
        kind={kind}
        points={[
          { date: "2026-01-01", values: { one: -1e308, two: 1e308 } },
          { date: "2026-01-02", values: { one: 1e308, two: 1e308 } },
          { date: "2026-01-03", values: { one: 0, two: 0 } },
        ]}
        series={series}
      />,
    );
    for (const element of container.querySelectorAll("svg *")) {
      for (const name of [
        "x",
        "y",
        "x1",
        "x2",
        "y1",
        "y2",
        "cx",
        "cy",
        "height",
        "width",
      ]) {
        const value = element.getAttribute(name);
        if (value !== null)
          expect(Number.isFinite(Number(value)), `${name}=${value}`).toBe(true);
      }
    }
  },
);
it("does not bridge missing line samples and gives all-missing views a meaningful empty state", () => {
  const { container, rerender } = render(
    <TimeSeriesPlot title="Gaps" points={points} series={series.slice(0, 1)} />,
  );
  expect(
    container.querySelectorAll('svg line[stroke-dasharray="6 5"]'),
  ).toHaveLength(0);
  rerender(
    <TimeSeriesPlot
      title="Gaps"
      points={[{ date: "2026-01-01", values: { one: null } }]}
      series={series.slice(0, 1)}
    />,
  );
  expect(screen.queryByRole("slider")).toBeNull();
  expect(
    screen.getByText("Missing data is never treated as zero."),
  ).toBeInTheDocument();
});
it("shows tooltips only at plotted line samples and clears them when the pointer leaves", () => {
  const { container } = render(
    <TimeSeriesPlot
      title="Pointer"
      points={[
        { date: "2026-01-01", values: { one: "10" } },
        { date: "2026-01-02", values: { one: "20" } },
      ]}
      series={series.slice(0, 1)}
    />,
  );
  const explorer = screen.getByRole("slider");
  Object.defineProperty(explorer, "getBoundingClientRect", {
    value: () => ({ left: 0, top: 0, width: 900, height: 270 }),
  });
  fireEvent.pointerMove(explorer, { clientX: 92, clientY: 124.5 });
  expect(container.querySelector(".ds-chart-tooltip")).toHaveTextContent("10");
  fireEvent.pointerLeave(explorer);
  expect(container.querySelector(".ds-chart-tooltip")).toBeNull();
});
it("legend ignores stale hidden IDs when protecting the last visible series", async () => {
  const change = vi.fn();
  render(
    <ChartLegend
      series={series}
      hidden={["obsolete", "one"]}
      onToggle={change}
    />,
  );
  expect(
    screen.getByRole("button", { name: "Completed Shown" }),
  ).toBeDisabled();
  await userEvent.click(
    screen.getByRole("button", { name: "Requests Hidden" }),
  );
  expect(change).toHaveBeenCalledWith("one");
});
it("keeps sparkline gaps and isolated values visible without invalid geometry", () => {
  const { container } = render(
    <Sparkline
      values={[1, null, Infinity, 2, -1e308, 1e308]}
      label="Exact supplied trend"
    />,
  );
  expect(screen.getByRole("img")).toHaveAccessibleDescription(
    "1, missing, missing, 2, -1e+308, 1e+308",
  );
  expect(container.querySelectorAll("line")).toHaveLength(2);
  expect(container.querySelectorAll("circle")).toHaveLength(4);
  expect(container.innerHTML).not.toContain("NaN");
});
it("comparison, waterfall and relationship renderers retain supplied text/order instead of inferring totals or meaning", () => {
  render(
    <>
      <ComparisonBars
        items={[
          { id: "x", label: "Other", value: "1,234.5600 items", fraction: 2 },
        ]}
      />
      <WaterfallPlot
        title="Bridge"
        steps={[
          { label: "First", start: 0, end: 2, value: "Exact first" },
          { label: "First", start: 2, end: -1, value: "Exact second" },
        ]}
      />
      <RelationshipFlow
        items={[
          {
            id: "r",
            from: "Source",
            to: "Destination",
            value: "Supplied exact value",
            detail: "Unreviewed",
          },
        ]}
      />
    </>,
  );
  expect(screen.getByText("1,234.5600 items")).toBeInTheDocument();
  expect(screen.getAllByText("Exact second")).toHaveLength(2);
  expect(screen.getByText("Unreviewed")).toBeInTheDocument();
});
it("groups exact fractional strings without rounding", () => {
  expect(groupPlotValue("-1234567890123456789.00001234")).toBe(
    "-1,234,567,890,123,456,789.00001234",
  );
  expect(groupPlotValue(null)).toBe("—");
  expect(groupPlotValue("0.0000")).toBe("0.0000");
});
it.each(["bar", "stacked"] as const)(
  "hit-tests the rendered %s rectangles",
  (kind) => {
    const { container } = render(
      <TimeSeriesPlot
        title="Bars"
        kind={kind}
        points={[
          { date: "2026-01-01", values: { one: "10", two: "20" } },
          { date: "2026-01-02", values: { one: "10", two: "20" } },
        ]}
        series={series}
      />,
    );
    const explorer = screen.getByRole("slider");
    Object.defineProperty(explorer, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 900, height: 270 }),
    });
    fireEvent.pointerMove(explorer, {
      clientX: kind === "bar" ? 103 : 92,
      clientY: 40,
    });
    expect(container.querySelector(".ds-chart-tooltip")).toHaveTextContent(
      "20",
    );
  },
);
it("delegates retry and suppresses stale chart interaction while loading", async () => {
  const retry = vi.fn();
  const { rerender } = render(
    <TimeSeriesPlot
      title="Async"
      series={series}
      points={points}
      error="Source unavailable"
      onRetry={retry}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledOnce();
  rerender(
    <TimeSeriesPlot title="Async" series={series} points={points} loading />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("Loading Async");
  expect(screen.queryByRole("slider")).toBeNull();
});
it("reports an oversized dataset before plotting without throwing or silently truncating values", () => {
  const many = Array.from({ length: 2001 }, (_, index) => ({
    id: String(index),
    date: "2026-01-01",
    values: { one: "1" },
  }));
  render(<TimeSeriesPlot title="Oversized" points={many} series={series} />);
  expect(screen.getByRole("alert")).toHaveTextContent("Choose a smaller range");
  expect(screen.queryByRole("slider")).toBeNull();
  expect(many).toHaveLength(2001);
});
