import type { ComponentPropsWithRef, ReactNode } from "react";
export type TableProps = ComponentPropsWithRef<"table"> & {
  caption?: ReactNode;
  captionHidden?: boolean;
  density?: "comfortable" | "compact";
  stickyHeader?: boolean;
  mobileLayout?: "scroll" | "stack";
};
export function Table({
  caption,
  captionHidden = false,
  density = "comfortable",
  stickyHeader = false,
  mobileLayout = "scroll",
  className = "",
  children,
  ...props
}: TableProps) {
  return (
    <table
      {...props}
      data-density={density}
      data-mobile-layout={mobileLayout}
      className={`ds-data-table ${stickyHeader ? "ds-table--sticky" : ""} ${className}`}
    >
      {caption !== undefined && (
        <caption className={captionHidden ? "ds-data-sr-only" : undefined}>
          {caption}
        </caption>
      )}
      {children}
    </table>
  );
}
export function TableHead(props: ComponentPropsWithRef<"thead">) {
  return <thead {...props} />;
}
export function TableBody(props: ComponentPropsWithRef<"tbody">) {
  return <tbody {...props} />;
}
export function TableRow(props: ComponentPropsWithRef<"tr">) {
  return <tr {...props} />;
}
export function TableHeaderCell({
  scope = "col",
  ...props
}: ComponentPropsWithRef<"th">) {
  return <th {...props} scope={scope} />;
}
export function TableCell(props: ComponentPropsWithRef<"td">) {
  return <td {...props} />;
}
export function NumericCell({
  className = "",
  ...props
}: ComponentPropsWithRef<"td">) {
  return <td {...props} className={`ds-numeric ${className}`} />;
}
export function EmptyRow({
  colSpan,
  children = "No records available.",
}: {
  colSpan: number;
  children?: ReactNode;
}) {
  if (!Number.isInteger(colSpan) || colSpan < 1)
    throw new RangeError("EmptyRow colSpan must be a positive integer");
  return (
    <tr>
      <td colSpan={colSpan} className="ds-empty-cell">
        {children}
      </td>
    </tr>
  );
}
export type TableScrollRegionProps = ComponentPropsWithRef<"div"> & {
  label: string;
  bounded?: boolean;
};
export function TableScrollRegion({
  label,
  bounded = false,
  className = "",
  ...props
}: TableScrollRegionProps) {
  return (
    <div
      {...props}
      className={`ds-table-scroll ${bounded ? "ds-table-scroll--bounded" : ""} ${className}`}
      role="region"
      aria-label={label}
      tabIndex={props.tabIndex ?? 0}
    />
  );
}
