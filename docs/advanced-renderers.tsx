import { lazy, Suspense, useState } from "react";
import {
  TimeSeriesPlot,
  type PlotPoint,
} from "../src/components/patterns/time-series-plot";
import {
  ChartFrame,
  ChartHeader,
  ChartLegend,
  ChartFooter,
} from "../src/components/patterns/chart-primitives";
import {
  ComparisonBars,
  WaterfallPlot,
  RelationshipFlow,
  Sparkline,
} from "../src/components/patterns/comparison-plots";
import { Select } from "../src/components/ui/fields";
import { Button } from "../src/components/ui/button";
const PdfExample = lazy(() => import("./pdf-example"));
const series = [
  { id: "planned", label: "Planned" },
  { id: "completed", label: "Completed", pattern: "dashed" as const },
];
const datasets: Record<string, PlotPoint[]> = {
  ready: [
    {
      date: "2026-01-01",
      values: { planned: "1200.0000", completed: "900.0000" },
    },
    {
      date: "2026-02-01",
      values: { planned: "1450.0000", completed: null },
      annotation: "Source not supplied",
    },
    {
      date: "2026-03-01",
      values: { planned: "1600.0000", completed: "1350.0000" },
      dashed: true,
      status: "Provisional",
    },
  ],
  zero: [
    { date: "2026-01-01", values: { planned: "0.0000", completed: "0.0000" } },
    { date: "2026-02-01", values: { planned: "0.0000", completed: "0.0000" } },
  ],
  missing: [{ date: "2026-01-01", values: { planned: null, completed: null } }],
  single: [
    {
      date: "2026-01-01",
      values: { planned: "1234.5600", completed: "0.0000" },
    },
  ],
  signed: [
    {
      date: "2026-01-01",
      values: { planned: "125.0000", completed: "-75.0000" },
    },
    {
      date: "2026-02-01",
      values: { planned: "-50.0000", completed: "-25.0000" },
    },
  ],
  precision: [
    {
      date: "2026-01-01",
      values: {
        planned: "9007199254740993.1234",
        completed: "9007199254740993.1233",
      },
    },
    {
      date: "2026-02-01",
      values: {
        planned: "9007199254740993.1233",
        completed: "9007199254740993.1234",
      },
    },
  ],
};
export function AdvancedRenderers() {
  const [kind, setKind] = useState<"line" | "bar" | "stacked">("line"),
    [mode, setMode] = useState("ready"),
    [hidden, setHidden] = useState<string[]>([]),
    [state, setState] = useState("ready"),
    [pdfVisible, setPdfVisible] = useState(false);
  const visible = series.filter((item) => !hidden.includes(item.id));
  return (
    <>
      <section id="advanced-charts">
        <p className="eyebrow">Milestone 5 / Optional renderers</p>
        <h2>Render the evidence. Keep the meaning in your product.</h2>
        <p>
          Charts install independently of PDF.js. Supplied decimal strings
          remain exact in keyboard summaries, tooltips and data tables; plot
          coordinates are approximate. Missing values stay missing, with gaps in
          lines. A negative value has no automatic business severity.
        </p>
        <div className="fields-grid">
          <Select
            label="Chart renderer"
            value={kind}
            onChange={(event) => setKind(event.target.value as typeof kind)}
            options={[
              { value: "line", label: "Line" },
              { value: "bar", label: "Grouped bars" },
              { value: "stacked", label: "Signed stacked bars" },
            ]}
          />
          <Select
            label="Chart dataset"
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            options={Object.keys(datasets).map((value) => ({
              value,
              label: value,
            }))}
          />
          <Select
            label="Chart state"
            value={state}
            onChange={(event) => setState(event.target.value)}
            options={["ready", "loading", "error"].map((value) => ({
              value,
              label: value,
            }))}
          />
        </div>
        <div className="example">
          <ChartFrame label="Harbour capacity">
            <ChartHeader
              title="Harbour capacity"
              description="Fictional project work, in supplied units."
            />
            <ChartLegend
              series={series}
              hidden={hidden}
              compact
              onToggle={(id) =>
                setHidden((current) =>
                  current.includes(id)
                    ? current.filter((value) => value !== id)
                    : [...current, id],
                )
              }
            />
            <TimeSeriesPlot
              key={`${mode}:${kind}:${visible.map((item) => item.id)}`}
              title="Harbour capacity"
              unit="units"
              kind={kind}
              points={datasets[mode]}
              series={visible}
              loading={state === "loading"}
              error={
                state === "error"
                  ? "The simulated source is unavailable. Your product supplies retry."
                  : undefined
              }
              onRetry={() => setState("ready")}
            />
            <ChartFooter>
              Use arrow keys, Home and End on the plot. Open the data table for
              exact values. Ranges, filters, business calculations and exports
              belong to the product.
            </ChartFooter>
          </ChartFrame>
        </div>
        <p>
          Supported here: bounded time series, grouped/signed stacked bars,
          comparison bars, supplied waterfall steps, relationship lists and
          sparklines. These components do not calculate returns, aggregate
          accounts, infer transfers or serialize exports. The finance adapter
          retains those functions.
        </p>
        <div className="example">
          <ChartFrame label="Supplied comparison">
            <ChartHeader title="Supplied comparison" />
            <ComparisonBars
              items={[
                {
                  id: "a",
                  label: "Project A",
                  value: "1,234.5600 units",
                  fraction: 1,
                },
                {
                  id: "b",
                  label: "Project B",
                  value: "617.2800 units",
                  fraction: 0.5,
                },
              ]}
            />
            <p>
              Trend with a missing interval:{" "}
              <Sparkline
                label="Supplied trend with a gap"
                values={[1, 2, null, 3, 4, 3]}
              />
            </p>
            <RelationshipFlow
              items={[
                {
                  id: "r",
                  from: "Intake",
                  to: "Review",
                  value: "1,234.5600 units",
                  detail: "Supplied relationship",
                },
              ]}
            />
          </ChartFrame>
          <WaterfallPlot
            title="Workload bridge"
            description="Every step and label is supplied; this renderer calculates no totals."
            steps={[
              {
                label: "Opening",
                start: 0,
                end: 12,
                value: "12 units",
                total: true,
              },
              { label: "Completed", start: 12, end: 7, value: "−5 units" },
              {
                label: "Remaining",
                start: 0,
                end: 7,
                value: "7 units",
                total: true,
              },
            ]}
          />
        </div>
        <pre>
          <code>{`npx shadcn@4.23.0 add https://brochu-product-ui.vercel.app/r/v0.6.0/time-series-plot.json\n# Independent comparison renderers:\nnpx shadcn@4.23.0 add https://brochu-product-ui.vercel.app/r/v0.6.0/comparison-plots.json`}</code>
        </pre>
      </section>
      <section id="pdf-preview">
        <p className="eyebrow">Optional document rendering</p>
        <h2>A viewer with an explicit source policy.</h2>
        <p>
          Open the example to load PDF.js and its matching worker. The generic
          viewer receives a loader; your product supplies credentials,
          authorized source URLs, worker/assets, page anchors and resource
          limits. The demo uses a small fictional PDF from this site and sends
          no household data.
        </p>
        <Button variant="secondary" onClick={() => setPdfVisible(!pdfVisible)}>
          {pdfVisible ? "Close PDF example" : "Open PDF example"}
        </Button>
        {pdfVisible && (
          <Suspense
            fallback={<p role="status">Loading optional PDF example…</p>}
          >
            <PdfExample />
          </Suspense>
        )}
        <p>
          The viewer cancels loading/render tasks when sources change or it
          unmounts. Page text stays connected to the currently rendered page,
          with an original-source fallback. Canvas preview is a visual aid; it
          is not a complete PDF reader, a source authorizer, or a publication
          decision.
        </p>
        <pre>
          <code>{`npm install --save-exact pdfjs-dist@6.4.299\nnpx shadcn@4.23.0 add https://brochu-product-ui.vercel.app/r/v0.6.0/pdfjs-loader.json\n// Supply a worker URL built/copied from that exact installed version.\n// No worker, auth policy or source credentials are embedded in shared components.`}</code>
        </pre>
        <p>
          <a href="https://github.com/stephane-brochu/product-ui/blob/v0.6.0/docs/migrations/v0.6.0.md">
            Read renderer APIs, accessibility, source ownership and supported
            limits
          </a>
        </p>
      </section>
    </>
  );
}
