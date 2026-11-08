"use client";
import { Fragment, useId, useMemo, useState, type ReactNode } from "react";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { SearchInput, Select } from "./fields";
import { EmptyState, ErrorState, LoadingIndicator } from "./feedback";
import { Table, TableScrollRegion } from "./table";
import {
  TableToolbar,
  ResultCount,
  Pagination,
  ExportActions,
} from "../patterns/data-navigation";
export type TableValue = string | number | bigint | null | undefined;
export type Column<T> = {
  id: string;
  header: string;
  value: (row: T) => TableValue;
  render?: (row: T) => ReactNode;
  align?: "left" | "right";
  sortable?: boolean;
  compare?: (a: T, b: T) => number;
  mobileHidden?: boolean;
  sticky?: boolean;
  rowHeader?: boolean;
};
export type TableFilter<T> = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  matches: (row: T) => boolean;
};
export type TableSort = { id: string; descending: boolean };
export type DataTableProps<T> = {
  caption: string;
  columns: readonly Column<T>[];
  rows: readonly T[];
  rowId: (row: T) => string;
  rowLabel?: (row: T) => string;
  density?: "comfortable" | "compact";
  searchable?: boolean;
  filters?: readonly TableFilter<T>[];
  selectable?: boolean;
  selectedIds?: readonly string[];
  defaultSelectedIds?: readonly string[];
  onSelectionChange?: (ids: string[]) => void;
  details?: (row: T) => ReactNode;
  expandedIds?: readonly string[];
  onExpandedChange?: (ids: string[]) => void;
  pageSize?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
  sort?: TableSort | null;
  onSortChange?: (sort: TableSort | null) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  onExport?: (rows: readonly T[]) => void;
  exportLabel?: string;
  exporting?: boolean;
  exportError?: ReactNode;
  stickyHeader?: boolean;
};
function isMissing(v: TableValue) {
  return v == null || (typeof v === "number" && !Number.isFinite(v));
}
/** Exact decimal-string ordering; this never calculates, rounds or formats a displayed value. */
export function compareTableValues(a: TableValue, b: TableValue): number {
  if (isMissing(a) || isMissing(b))
    return isMissing(a) ? (isMissing(b) ? 0 : 1) : -1;
  const left = String(a),
    right = String(b),
    numeric = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
  if (numeric.test(left) && numeric.test(right)) {
    const parts = (v: string) => {
      const [w, f = ""] = v.replace(/^[+-]/, "").split(".");
      const whole = (w || "0").replace(/^0+(?=\d)/, "");
      const zero = /^0+$/.test(whole) && /^0*$/.test(f);
      return { w: whole, f, negative: !zero && v.startsWith("-") };
    };
    const l = parts(left),
      r = parts(right);
    if (l.negative !== r.negative) return l.negative ? -1 : 1;
    const n = Math.max(l.f.length, r.f.length),
      lf = l.f.padEnd(n, "0"),
      rf = r.f.padEnd(n, "0");
    const result =
      l.w.length !== r.w.length
        ? Math.sign(l.w.length - r.w.length)
        : l.w !== r.w
          ? l.w < r.w
            ? -1
            : 1
          : lf === rf
            ? 0
            : lf < rf
              ? -1
              : 1;
    return result === 0 ? 0 : l.negative ? -result : result;
  }
  return left.localeCompare(right, "en", { numeric: true });
}
export function DataTable<T>({
  caption,
  columns,
  rows,
  rowId,
  rowLabel,
  density = "comfortable",
  searchable = false,
  filters = [],
  selectable = false,
  selectedIds,
  defaultSelectedIds = [],
  onSelectionChange,
  details,
  expandedIds,
  onExpandedChange,
  pageSize = 8,
  page,
  onPageChange,
  query,
  onQueryChange,
  sort,
  onSortChange,
  loading = false,
  error,
  onRetry,
  emptyMessage = "No records match these filters.",
  onExport,
  exportLabel = "Export CSV",
  exporting = false,
  exportError,
  stickyHeader = true,
}: DataTableProps<T>) {
  const instance = useId();
  const [localQuery, setQuery] = useState(""),
    [localSort, setSort] = useState<TableSort | null>(null),
    [localPage, setPage] = useState(0),
    [localSelected, setSelected] =
      useState<readonly string[]>(defaultSelectedIds),
    [localExpanded, setExpanded] = useState<readonly string[]>([]);
  const search = query ?? localQuery,
    ordering = sort === undefined ? localSort : sort,
    requestedPage = page ?? localPage;
  if (!Number.isInteger(pageSize) || pageSize < 1)
    throw new RangeError("DataTable pageSize must be a positive integer");
  if (!Number.isInteger(requestedPage) || requestedPage < 0)
    throw new RangeError("DataTable page must be a non-negative integer");
  if (
    !columns.length ||
    new Set(columns.map((c) => c.id)).size !== columns.length ||
    columns.some((c) => typeof c.id !== "string" || !c.id.trim())
  )
    throw new Error("DataTable requires unique non-empty column IDs");
  const ids = rows.map(rowId);
  if (
    ids.some((id) => typeof id !== "string" || !id.trim()) ||
    new Set(ids).size !== ids.length
  )
    throw new Error("DataTable requires unique non-empty row IDs");
  const valid = new Set(ids),
    selected = [...new Set(selectedIds ?? localSelected)].filter((id) =>
      valid.has(id),
    ),
    expanded = [...new Set(expandedIds ?? localExpanded)].filter((id) =>
      valid.has(id),
    );
  const filtered = useMemo(() => {
    const result = rows.filter(
      (row) =>
        filters.every((f) => f.matches(row)) &&
        (!search ||
          columns.some((c) =>
            String(c.value(row) ?? "")
              .toLocaleLowerCase()
              .includes(search.toLocaleLowerCase()),
          )),
    );
    const col = columns.find((c) => c.id === ordering?.id && c.sortable);
    if (col && ordering)
      result.sort((a, b) => {
        const av = col.value(a),
          bv = col.value(b);
        if (isMissing(av) || isMissing(bv))
          return isMissing(av) ? (isMissing(bv) ? 0 : 1) : -1;
        const compared = col.compare
          ? col.compare(a, b)
          : compareTableValues(av, bv);
        return (
          (Number.isFinite(compared) ? compared : 0) *
          (ordering.descending ? -1 : 1)
        );
      });
    return result;
  }, [rows, filters, search, columns, ordering]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize)),
    currentPage = Math.min(requestedPage, pages - 1),
    visible = filtered.slice(
      currentPage * pageSize,
      (currentPage + 1) * pageSize,
    ),
    selectedVisible = visible.filter((row) =>
      selected.includes(rowId(row)),
    ).length;
  function changePage(next: number) {
    setPage(next);
    onPageChange?.(next);
  }
  function selection(next: string[]) {
    setSelected(next);
    onSelectionChange?.(next);
  }
  function expand(next: string[]) {
    setExpanded(next);
    onExpandedChange?.(next);
  }
  function sortBy(id: string) {
    const next = {
      id,
      descending: ordering?.id === id ? !ordering.descending : false,
    };
    setSort(next);
    onSortChange?.(next);
    changePage(0);
  }
  const count = columns.length + (selectable ? 1 : 0) + (details ? 1 : 0),
    unavailable = loading || !!error;
  return (
    <div
      className="ds-table-region"
      data-density={density}
      aria-busy={loading || undefined}
    >
      <TableToolbar label={`${caption} controls`}>
        {searchable && (
          <SearchInput
            label={`Search ${caption.toLowerCase()}`}
            value={search}
            onChange={(e) => {
              setQuery(e.target.value);
              onQueryChange?.(e.target.value);
              changePage(0);
            }}
          />
        )}
        {filters.map((f) => (
          <Select
            key={f.label}
            label={f.label}
            value={f.value}
            options={f.options}
            onChange={(e) => {
              f.onChange(e.target.value);
              changePage(0);
            }}
          />
        ))}
        {onExport && (
          <ExportActions
            onExport={() => onExport(filtered)}
            exportLabel={exportLabel}
            disabled={unavailable || !filtered.length}
            busy={exporting}
            error={exportError}
          />
        )}
      </TableToolbar>
      {loading ? (
        <LoadingIndicator label={`Loading ${caption.toLowerCase()}`} />
      ) : error ? (
        <ErrorState title={error} onRetry={onRetry} />
      ) : (
        <>
          <TableScrollRegion
            label={`${caption} table, scroll horizontally if needed`}
            bounded
          >
            <Table
              caption={caption}
              density={density}
              stickyHeader={stickyHeader}
            >
              <thead>
                <tr>
                  {selectable && (
                    <th scope="col">
                      <Checkbox
                        label="Select all rows on this page"
                        indeterminate={
                          selectedVisible > 0 &&
                          selectedVisible < visible.length
                        }
                        checked={
                          visible.length > 0 &&
                          selectedVisible === visible.length
                        }
                        disabled={!visible.length}
                        onChange={(e) =>
                          selection(
                            e.target.checked
                              ? [
                                  ...new Set([
                                    ...selected,
                                    ...visible.map(rowId),
                                  ]),
                                ]
                              : selected.filter(
                                  (id) =>
                                    !visible.some((row) => rowId(row) === id),
                                ),
                          )
                        }
                      />
                    </th>
                  )}
                  {details && (
                    <th scope="col">
                      <span className="ds-data-sr-only">Details</span>
                    </th>
                  )}
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      scope="col"
                      className={`${col.align === "right" ? "ds-numeric" : ""} ${col.mobileHidden ? "ds-mobile-hidden" : ""} ${col.sticky ? "ds-sticky-col" : ""}`}
                      aria-sort={
                        ordering?.id === col.id && col.sortable
                          ? ordering.descending
                            ? "descending"
                            : "ascending"
                          : undefined
                      }
                    >
                      {col.sortable ? (
                        <button type="button" onClick={() => sortBy(col.id)}>
                          {col.header}
                          <span aria-hidden="true">
                            {" "}
                            {ordering?.id === col.id
                              ? ordering.descending
                                ? "↓"
                                : "↑"
                              : "↕"}
                          </span>
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!visible.length ? (
                  <tr>
                    <td colSpan={count}>
                      <EmptyState title="Nothing to show">
                        {emptyMessage}
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  visible.map((row) => {
                    const id = rowId(row),
                      label = rowLabel?.(row) ?? id,
                      open = expanded.includes(id),
                      detailId = `${instance}-${encodeURIComponent(id)}`;
                    return (
                      <Fragment key={id}>
                        <tr data-selected={selected.includes(id) || undefined}>
                          {selectable && (
                            <td>
                              <Checkbox
                                label={`Select row ${label}`}
                                checked={selected.includes(id)}
                                onChange={() =>
                                  selection(
                                    selected.includes(id)
                                      ? selected.filter((x) => x !== id)
                                      : [...selected, id],
                                  )
                                }
                              />
                            </td>
                          )}
                          {details && (
                            <td>
                              <Button
                                variant="tertiary"
                                size="compact"
                                aria-expanded={open}
                                aria-controls={open ? detailId : undefined}
                                aria-label={`${open ? "Hide" : "Show"} details for row ${label}`}
                                onClick={() =>
                                  expand(
                                    open
                                      ? expanded.filter((x) => x !== id)
                                      : [...expanded, id],
                                  )
                                }
                              >
                                {open ? "−" : "+"}
                              </Button>
                            </td>
                          )}
                          {columns.map((col) => {
                            const Cell = col.rowHeader ? "th" : "td";
                            const raw = col.render ? undefined : col.value(row);
                            return (
                              <Cell
                                key={col.id}
                                scope={col.rowHeader ? "row" : undefined}
                                className={`${col.align === "right" ? "ds-numeric" : ""} ${col.mobileHidden ? "ds-mobile-hidden" : ""} ${col.sticky ? "ds-sticky-col" : ""}`}
                              >
                                {col.render
                                  ? col.render(row)
                                  : isMissing(raw)
                                    ? "—"
                                    : raw}
                              </Cell>
                            );
                          })}
                        </tr>
                        {open && details && (
                          <tr className="ds-detail-row" id={detailId}>
                            <td colSpan={count}>{details(row)}</td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </Table>
          </TableScrollRegion>
          <div className="ds-table-footer">
            <ResultCount
              count={filtered.length}
              total={rows.length}
              selected={selectable ? selected.length : 0}
            />
            <Pagination
              label={`${caption} pagination`}
              page={currentPage}
              pageCount={pages}
              onPageChange={changePage}
            />
          </div>
        </>
      )}
    </div>
  );
}
export function ManagementTable<T>(props: DataTableProps<T>) {
  return <DataTable {...props} density="compact" />;
}
