import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import {
  DataTable,
  compareTableValues,
  type Column,
} from "../src/components/ui/data-table";
import {
  Table,
  TableScrollRegion,
  NumericCell,
  EmptyRow,
  TableHeaderCell,
} from "../src/components/ui/table";
import {
  Metric,
  MetricGroup,
  DeltaValue,
} from "../src/components/patterns/metrics";
import {
  Pagination,
  ExportActions,
} from "../src/components/patterns/data-navigation";
import { SourceReference } from "../src/components/patterns/source-reference";
const rows = [
  { id: "one", name: "Alpha", value: "9007199254740993.1234" },
  { id: "two", name: "Beta", value: "9007199254740993.1233" },
  { id: "three", name: "Gamma", value: null },
  { id: "four", name: "Delta", value: "-0.0001" },
];
const columns: Column<(typeof rows)[number]>[] = [
  { id: "name", header: "Name", value: (r) => r.name, rowHeader: true },
  {
    id: "value",
    header: "Value",
    value: (r) => r.value,
    sortable: true,
    align: "right",
  },
];
it("orders exact signed decimal strings without precision loss and treats negative zero as zero", () => {
  expect(compareTableValues(rows[0].value, rows[1].value)).toBeGreaterThan(0);
  expect(compareTableValues("-.001", "-0.01")).toBeGreaterThan(0);
  expect(compareTableValues("-0.000", "0")).toBe(0);
  expect(compareTableValues("1.20", "1.2000")).toBe(0);
  expect(compareTableValues(3n, 11n)).toBeLessThan(0);
  expect(compareTableValues(null, "0")).toBeGreaterThan(0);
});
it("sorts both directions with nulls last, preserves exact text, and announces sort state", async () => {
  const user = userEvent.setup();
  render(
    <DataTable
      caption="Positions"
      columns={columns}
      rows={rows}
      rowId={(r) => r.id}
    />,
  );
  const table = screen.getByRole("table", { name: "Positions" });
  await user.click(screen.getByRole("button", { name: /Value/ }));
  expect(within(table).getAllByRole("row")[1]).toHaveTextContent("Delta");
  expect(within(table).getAllByRole("row").at(-1)).toHaveTextContent("Gamma");
  expect(screen.getByRole("columnheader", { name: /Value/ })).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
  await user.click(screen.getByRole("button", { name: /Value/ }));
  expect(within(table).getAllByRole("row")[1]).toHaveTextContent("Alpha");
  expect(within(table).getAllByRole("row").at(-1)).toHaveTextContent("Gamma");
  expect(table).toHaveTextContent("9007199254740993.1234");
});
it("searches, resets the page, paginates, and exports every filtered row in sorted order", async () => {
  const user = userEvent.setup(),
    exportRows = vi.fn();
  render(
    <DataTable
      caption="Positions"
      columns={columns}
      rows={rows}
      rowId={(r) => r.id}
      pageSize={2}
      searchable
      onExport={exportRows}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
  await user.type(screen.getByRole("searchbox"), "Alpha");
  expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Export CSV" }));
  expect(exportRows).toHaveBeenLastCalledWith([rows[0]]);
  await user.clear(screen.getByRole("searchbox"));
  await user.click(screen.getByRole("button", { name: /Value/ }));
  await user.click(screen.getByRole("button", { name: "Export CSV" }));
  expect(exportRows.mock.calls.at(-1)?.[0]).toEqual([
    rows[3],
    rows[1],
    rows[0],
    rows[2],
  ]);
});
it("selects the visible page only, retains other-page selection, and announces mixed selection", async () => {
  const user = userEvent.setup(),
    change = vi.fn();
  render(
    <DataTable
      caption="Selection"
      columns={columns}
      rows={rows}
      rowId={(r) => r.id}
      selectable
      pageSize={2}
      onSelectionChange={change}
    />,
  );
  await user.click(screen.getByRole("checkbox", { name: "Select row one" }));
  expect(
    screen.getByRole("checkbox", { name: "Select all rows on this page" }),
  ).toHaveAttribute("aria-checked", "mixed");
  await user.click(
    screen.getByRole("checkbox", { name: "Select all rows on this page" }),
  );
  expect(change).toHaveBeenLastCalledWith(["one", "two"]);
  await user.click(screen.getByRole("button", { name: "Next" }));
  await user.click(screen.getByRole("checkbox", { name: "Select row three" }));
  expect(change).toHaveBeenLastCalledWith(["one", "two", "three"]);
});
it("ignores stale selection/expansion IDs and clamps pages after row replacement without callback effects", async () => {
  const user = userEvent.setup(),
    selection = vi.fn(),
    page = vi.fn();
  const view = render(
    <DataTable
      caption="Replacement"
      columns={columns}
      rows={rows}
      rowId={(r) => r.id}
      selectable
      selectedIds={["one", "stale"]}
      onSelectionChange={selection}
      page={1}
      onPageChange={page}
      pageSize={2}
      details={(r) => <p>Details for {r.name}</p>}
      expandedIds={["one", "stale"]}
    />,
  );
  view.rerender(
    <DataTable
      caption="Replacement"
      columns={columns}
      rows={[rows[1]]}
      rowId={(r) => r.id}
      selectable
      selectedIds={["one", "stale"]}
      onSelectionChange={selection}
      page={1}
      onPageChange={page}
      pageSize={2}
      details={(r) => <p>Details for {r.name}</p>}
      expandedIds={["one", "stale"]}
    />,
  );
  expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
  expect(screen.queryByText("Details for Alpha")).not.toBeInTheDocument();
  expect(
    screen.getByRole("checkbox", { name: "Select row two" }),
  ).not.toBeChecked();
  expect(selection).not.toHaveBeenCalled();
  expect(page).not.toHaveBeenCalled();
  await user.click(screen.getByRole("checkbox", { name: "Select row two" }));
  expect(selection).toHaveBeenCalledWith(["two"]);
});
it("supports controlled query sort and page requests", async () => {
  const user = userEvent.setup();
  function Controlled() {
    const [query, setQuery] = useState(""),
      [page, setPage] = useState(0),
      [sort, setSort] = useState<{ id: string; descending: boolean } | null>(
        null,
      );
    return (
      <DataTable
        caption="Controlled"
        rows={rows}
        columns={columns}
        rowId={(r) => r.id}
        query={query}
        onQueryChange={setQuery}
        page={page}
        onPageChange={setPage}
        sort={sort}
        onSortChange={setSort}
        searchable
        pageSize={2}
      />
    );
  }
  render(<Controlled />);
  await user.click(screen.getByRole("button", { name: "Next" }));
  await user.click(screen.getByRole("button", { name: /Value/ }));
  expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  await user.type(screen.getByRole("searchbox"), "Beta");
  expect(screen.getByRole("table")).toHaveTextContent("Beta");
  expect(screen.getByRole("table")).not.toHaveTextContent("Alpha");
});
it("connects expandable row controls to their detail content", async () => {
  render(
    <DataTable
      caption="Detail"
      rows={rows}
      columns={columns}
      rowId={(r) => r.id}
      details={(r) => <p>Extra {r.name}</p>}
    />,
  );
  const button = screen.getByRole("button", {
    name: "Show details for row one",
  });
  await userEvent.click(button);
  expect(button).toHaveAttribute("aria-expanded", "true");
  const id = button.getAttribute("aria-controls")!;
  expect(document.getElementById(id)).toHaveTextContent("Extra Alpha");
  await userEvent.click(button);
  expect(screen.queryByText("Extra Alpha")).not.toBeInTheDocument();
});
it("renders loading/error/empty states and prevents stale exports", async () => {
  const retry = vi.fn(),
    exportRows = vi.fn();
  const view = render(
    <DataTable
      caption="Async"
      columns={columns}
      rows={rows}
      rowId={(r) => r.id}
      loading
      onExport={exportRows}
    />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("Loading async");
  expect(screen.getByRole("button", { name: "Export CSV" })).toBeDisabled();
  view.rerender(
    <DataTable
      caption="Async"
      columns={columns}
      rows={rows}
      rowId={(r) => r.id}
      error="Unable to load"
      onRetry={retry}
      onExport={exportRows}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledOnce();
  expect(screen.getByRole("button", { name: "Export CSV" })).toBeDisabled();
  view.rerender(
    <DataTable
      caption="Async"
      columns={columns}
      rows={[]}
      rowId={(r) => r.id}
      onExport={exportRows}
    />,
  );
  expect(
    screen.getByRole("heading", { name: "Nothing to show" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
});
it("rejects invalid page sizes, duplicate IDs, and empty columns", () => {
  const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() =>
    render(
      <DataTable
        caption="Bad"
        columns={columns}
        rows={rows}
        rowId={(r) => r.id}
        pageSize={0}
      />,
    ),
  ).toThrow("positive integer");
  expect(() =>
    render(
      <DataTable
        caption="Bad"
        columns={columns}
        rows={rows}
        rowId={() => "duplicate"}
      />,
    ),
  ).toThrow("unique non-empty row IDs");
  expect(() =>
    render(
      <DataTable caption="Bad" columns={[]} rows={rows} rowId={(r) => r.id} />,
    ),
  ).toThrow("unique non-empty column IDs");
  quiet.mockRestore();
});
it("renders server-compatible tables with captions, header scopes and a named keyboard scroll region", () => {
  const html = renderToString(
    <TableScrollRegion label="Evidence table">
      <Table caption="Evidence">
        <thead>
          <tr>
            <TableHeaderCell>Source</TableHeaderCell>
          </tr>
        </thead>
        <tbody>
          <tr>
            <NumericCell>0.0000</NumericCell>
          </tr>
          <EmptyRow colSpan={1} />
        </tbody>
      </Table>
    </TableScrollRegion>,
  );
  expect(html).toContain('scope="col"');
  render(<div dangerouslySetInnerHTML={{ __html: html }} />);
  expect(
    screen.getByRole("region", { name: "Evidence table" }),
  ).toHaveAttribute("tabindex", "0");
  expect(screen.getByRole("table", { name: "Evidence" })).toHaveTextContent(
    "0.0000",
  );
});
it("preserves missing versus zero metrics and separates direction from severity", () => {
  render(
    <MetricGroup>
      <Metric label="Count" value={0} />
      <Metric label="Missing" value={null} />
      <Metric label="Precise" value="9007199254740993.1234" />
      <Metric
        label="Change"
        value={
          <DeltaValue value="−2.00" percentage="−0.01%" direction="negative" />
        }
      />
    </MetricGroup>,
  );
  const metric = screen
    .getByRole("heading", { name: "Count" })
    .closest("article")!;
  expect(metric).toHaveTextContent("0");
  expect(
    screen.getByRole("heading", { name: "Missing" }).closest("article"),
  ).toHaveTextContent("—");
  expect(screen.getByText("9007199254740993.1234")).toBeInTheDocument();
  expect(screen.getByText("Decrease:").closest(".ds-delta")).toHaveAttribute(
    "data-tone",
    "neutral",
  );
});
it("keeps zero amount and independent percentage delta values", () => {
  render(
    <>
      <DeltaValue value={0} percentage="+2.00%" direction="neutral" />
      <DeltaValue percentage="−3.00%" direction="negative" />
    </>,
  );
  expect(screen.getByText("0")).toBeInTheDocument();
  expect(screen.getByText("(+2.00%)", { exact: false })).toBeInTheDocument();
  expect(screen.getByText("−3.00%")).toBeInTheDocument();
});
it("supports link pagination and busy export actions without owning URLs or downloads", async () => {
  const next = vi.fn();
  const view = render(
    <Pagination page={0} pageCount={3} nextHref="/records?page=2" />,
  );
  expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
    "href",
    "/records?page=2",
  );
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  view.rerender(
    <>
      <Pagination page={1} pageCount={3} onPageChange={next} />
      <ExportActions onExport={() => {}} busy error="Export failed" />
    </>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(next).toHaveBeenCalledWith(2);
  expect(screen.getByRole("button", { name: "Export CSV" })).toBeDisabled();
  expect(screen.getByRole("alert")).toHaveTextContent("Export failed");
});
it("makes external source links explicit and preserves supplied destinations", () => {
  render(
    <SourceReference
      href="https://example.com/evidence"
      label="Evidence"
      target="_blank"
      detail="Page 2"
    />,
  );
  expect(
    screen.getByRole("link", { name: "Evidence (opens in a new tab)" }),
  ).toHaveAttribute("rel", "noopener noreferrer");
  expect(screen.getByText("Page 2")).toBeInTheDocument();
});
