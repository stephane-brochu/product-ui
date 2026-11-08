import type { ComponentPropsWithRef, ReactNode } from "react";
import { Button, buttonClassName } from "../ui/button";
export function TableToolbar({
  label = "Table controls",
  className = "",
  ...props
}: ComponentPropsWithRef<"div"> & { label?: string }) {
  return (
    <div
      {...props}
      role="group"
      aria-label={label}
      className={`ds-table-toolbar ${className}`}
    />
  );
}
export function ResultCount({
  count,
  total,
  selected = 0,
  noun = "records",
}: {
  count: number;
  total?: number;
  selected?: number;
  noun?: string;
}) {
  return (
    <p className="ds-result-count" role="status">
      {count}
      {total !== undefined && total !== count ? ` of ${total}` : ""} {noun}
      {selected > 0 ? ` · ${selected} selected` : ""}
    </p>
  );
}
type Base = {
  page: number;
  pageCount: number;
  label?: string;
  pending?: boolean;
  className?: string;
};
export type PaginationProps = Base &
  (
    | {
        onPageChange: (page: number) => void;
        previousHref?: never;
        nextHref?: never;
      }
    | { onPageChange?: never; previousHref?: string; nextHref?: string }
  );
export function Pagination({
  page,
  pageCount,
  label = "Pagination",
  pending = false,
  className = "",
  onPageChange,
  previousHref,
  nextHref,
}: PaginationProps) {
  if (
    !Number.isInteger(page) ||
    page < 0 ||
    !Number.isInteger(pageCount) ||
    pageCount < 1
  )
    throw new RangeError(
      "Pagination requires a non-negative page and positive pageCount",
    );
  const current = Math.min(page, pageCount - 1);
  function action(
    text: string,
    target: number,
    enabled: boolean,
    href?: string,
  ) {
    return enabled && !pending && href ? (
      <a
        href={href}
        className={buttonClassName({ variant: "tertiary", size: "compact" })}
      >
        {text}
      </a>
    ) : (
      <Button
        variant="tertiary"
        size="compact"
        disabled={pending || !enabled || !onPageChange}
        onClick={onPageChange ? () => onPageChange(target) : undefined}
      >
        {text}
      </Button>
    );
  }
  return (
    <nav
      className={`ds-pagination ${className}`}
      aria-label={label}
      aria-busy={pending || undefined}
    >
      {action("Previous", current - 1, current > 0, previousHref)}
      <span aria-live="polite" aria-atomic="true">
        Page {current + 1} of {pageCount}
      </span>
      {action("Next", current + 1, current < pageCount - 1, nextHref)}
    </nav>
  );
}
export type ExportActionsProps = ComponentPropsWithRef<"div"> & {
  onExport?: () => void;
  onPrint?: () => void;
  exportLabel?: string;
  printLabel?: string;
  busy?: boolean;
  disabled?: boolean;
  error?: ReactNode;
};
export function ExportActions({
  onExport,
  onPrint,
  exportLabel = "Export CSV",
  printLabel = "Print / save PDF",
  busy = false,
  disabled = false,
  error,
  className = "",
  ...props
}: ExportActionsProps) {
  return (
    <div {...props} className={`ds-export-actions ${className}`}>
      {onPrint && (
        <Button
          variant="secondary"
          disabled={disabled || busy}
          onClick={onPrint}
        >
          {printLabel}
        </Button>
      )}
      {onExport && (
        <Button
          variant="secondary"
          disabled={disabled}
          loading={busy}
          onClick={onExport}
        >
          {exportLabel}
        </Button>
      )}
      {error && (
        <div role="alert" className="ds-export-error">
          {error}
        </div>
      )}
    </div>
  );
}
