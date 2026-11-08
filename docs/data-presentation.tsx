import { useState } from "react";
import { DataTable, type Column } from "../src/components/ui/data-table";
import {
  Table,
  TableScrollRegion,
  NumericCell,
} from "../src/components/ui/table";
import {
  Metric,
  MetricGroup,
  DeltaValue,
} from "../src/components/patterns/metrics";
import {
  Pagination,
  TableToolbar,
  ExportActions,
} from "../src/components/patterns/data-navigation";
import { SourceReference } from "../src/components/patterns/source-reference";
import { Button } from "../src/components/ui/button";
import { Select } from "../src/components/ui/fields";
import { formatExactNumber } from "./format-exact-number";
const initial = [
  {
    id: "harbour",
    name: "Harbour workspace",
    value: "9007199254740993.1234",
    status: "active",
  },
  {
    id: "meadow",
    name: "Meadow workspace",
    value: "9007199254740993.1233",
    status: "active",
  },
  { id: "ridge", name: "Ridge workspace", value: null, status: "paused" },
  { id: "birch", name: "Birch workspace", value: "0.0000", status: "active" },
  { id: "cedar", name: "Cedar workspace", value: "-0.0001", status: "paused" },
];
type Row = (typeof initial)[number];
const columns: Column<Row>[] = [
  {
    id: "name",
    header: "Workspace",
    value: (r) => r.name,
    rowHeader: true,
    sortable: true,
  },
  {
    id: "value",
    header: "Exact value",
    value: (r) => r.value,
    render: (r) => formatExactNumber(r.value) ?? "—",
    sortable: true,
    align: "right",
  },
  { id: "status", header: "State", value: (r) => r.status },
];
export function DataPresentation() {
  const [state, setState] = useState("ready"),
    [status, setStatus] = useState("all"),
    [rows, setRows] = useState(initial),
    [selection, setSelection] = useState<string[]>([]),
    [exported, setExported] = useState(""),
    [size, setSize] = useState("2"),
    [metric, setMetric] = useState("zero"),
    [tone, setTone] = useState<"neutral" | "success" | "danger">("neutral");
  const values: Record<string, string | null> = {
    zero: "0",
    missing: null,
    large: "9007199254740993.1234",
    negative: "−0.0001",
  };
  return (
    <>
      <section id="data-presentation">
        <p className="eyebrow">Milestone 2 / Data presentation</p>
        <h2>One table contract. Complete, testable states.</h2>
        <p>
          Sort the exact values, filter, page, select a page, and expand
          details. Decimal-string ordering keeps every digit; missing values
          stay last in either direction. Selection applies to the current page
          and retains selections elsewhere. Export calls the product with all
          filtered rows in their displayed sort order.
        </p>
        <div className="fields-grid">
          <Select
            label="Table state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            options={["ready", "loading", "error", "empty"].map((value) => ({
              value,
              label: value,
            }))}
          />
          <Select
            label="Rows per page"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            options={[
              { value: "2", label: "2" },
              { value: "5", label: "5" },
            ]}
          />
        </div>
        <div className="example">
          <DataTable
            caption="Synthetic workspaces"
            columns={columns}
            rows={state === "empty" ? [] : rows}
            rowId={(r) => r.id}
            rowLabel={(r) => r.name}
            searchable
            selectable
            pageSize={Number(size)}
            onSelectionChange={setSelection}
            filters={[
              {
                label: "Workspace state",
                value: status,
                options: [
                  { value: "all", label: "All states" },
                  { value: "active", label: "Active" },
                  { value: "paused", label: "Paused" },
                ],
                onChange: setStatus,
                matches: (r) => status === "all" || r.status === status,
              },
            ]}
            details={(r) => (
              <p>
                Details for {r.name}. This content is supplied by the product.
              </p>
            )}
            loading={state === "loading"}
            error={
              state === "error"
                ? "The preview could not load workspaces."
                : undefined
            }
            onRetry={() => setState("ready")}
            onExport={(filtered) =>
              setExported(JSON.stringify(filtered, null, 2))
            }
          />
        </div>
        <div className="button-row">
          <Button
            variant="secondary"
            onClick={() => setRows(rows.slice(1))}
            disabled={!rows.length}
          >
            Remove first preview row
          </Button>
          <Button
            variant="tertiary"
            onClick={() => {
              setRows(initial);
              setState("ready");
            }}
          >
            Restore preview rows
          </Button>
        </div>
        <p className="note">
          Last selection callback: {selection.join(", ") || "none"}. Removed IDs
          stop appearing in the table immediately. The product owns
          reconciliation of controlled external state.
        </p>
        {exported && (
          <pre aria-label="Export callback payload">
            <code>{exported}</code>
          </pre>
        )}
        <p>
          Client-side search, sorting and pagination run on supplied rows; this
          is not server pagination or virtualization. Controlled
          query/sort/page/selectedIds/expandedIds callbacks are available.
          Invalid page sizes and duplicate/empty row or column IDs are rejected.
          Replaced data clamps the displayed page and ignores stale
          selected/expanded IDs without emitting callbacks during rendering.
        </p>
        <pre>
          <code>{`<DataTable caption="Workspaces" columns={columns} rows={rows}\n  rowId={row => row.id} searchable selectable pageSize={8}\n  onExport={filteredRows => productExport(filteredRows)} />\n\nnpx shadcn@4.23.0 add https://brochu-product-ui.vercel.app/r/v0.4.0/data-table.json`}</code>
        </pre>
      </section>
      <section id="metric-values">
        <p className="eyebrow">Read-only presentation</p>
        <h2>Metrics preserve meaning, including zero.</h2>
        <div className="fields-grid">
          <Select
            label="Metric value example"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            options={["zero", "missing", "large", "negative"].map((value) => ({
              value,
              label: value,
            }))}
          />
          <Select
            label="Explicit change tone"
            value={tone}
            onChange={(e) => setTone(e.target.value as typeof tone)}
            options={["neutral", "success", "danger"].map((value) => ({
              value,
              label: value,
            }))}
          />
        </div>
        <div className="example">
          <MetricGroup>
            <Metric
              label="Supplied exact value"
              value={formatExactNumber(values[metric])}
              unit="units"
              description="Null is missing; zero remains zero."
            />
            <Metric
              label="Change"
              value={
                <DeltaValue
                  value="−0.0001"
                  percentage="−0.01%"
                  direction="negative"
                  tone={tone}
                />
              }
              description="Direction and business severity are independent."
            />
            <Metric
              label="Percentage only"
              value={<DeltaValue percentage="+2.00%" direction="positive" />}
              description="Amount and percentage are separate slots."
            />
          </MetricGroup>
        </div>
        <p>
          Metric and DeltaValue accept display-ready values and content slots.
          They do not calculate balances, percentages, dates or currency. Supply
          thousands separators in numeric displays, as these examples do without
          converting exact decimal strings to floating-point numbers. Sorting
          and export callbacks retain the original unformatted values. Supply
          direction explicitly; a decrease does not automatically mean a bad
          result. Shared styles wrap large values, stack on phones and support
          print layouts.
        </p>
        <div className="example">
          <TableScrollRegion label="Evidence preview, scroll if needed">
            <Table caption="Evidence preview">
              <thead>
                <tr>
                  <th scope="col">Reference</th>
                  <th scope="col">Reported value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    <SourceReference
                      href="https://example.com/evidence"
                      label="Synthetic evidence"
                      target="_blank"
                      detail="Page 2"
                    />
                  </th>
                  <NumericCell>0.0000</NumericCell>
                </tr>
              </tbody>
            </Table>
          </TableScrollRegion>
        </div>
        <p>
          The server-compatible Table primitives preserve native captions,
          header scopes and keyboard-scroll regions. NumericCell aligns supplied
          values without formatting them. SourceReference renders a supplied URL
          and an explicit new-tab cue. Products still authorize sources and
          define URLs.
        </p>
        <TableToolbar label="Server pagination example">
          <Pagination
            page={0}
            pageCount={3}
            nextHref="#data-presentation"
            label="Example linked pages"
          />
        </TableToolbar>
        <p>
          Pagination supports callbacks for local tables or supplied
          previous/next links for server-rendered navigation. ExportActions
          renders supplied export/print callbacks, pending/disabled states and
          errors; it owns no serializer, file download or print command.
        </p>
        <ExportActions
          onExport={() =>
            setExported(
              "Export callback selected; the product supplies the serializer.",
            )
          }
          onPrint={() =>
            setExported(
              "Print callback selected; no print dialog opened in this demo.",
            )
          }
          exportLabel="Simulate export callback"
          printLabel="Simulate print callback"
        />
        <p>
          <a href="https://github.com/stephane-brochu/product-ui/blob/v0.4.0/docs/migrations/v0.4.0.md">
            Read the data-presentation contracts and migration
          </a>
          .
        </p>
      </section>
    </>
  );
}
