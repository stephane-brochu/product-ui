import type { HTMLAttributes, ReactNode } from "react";

/** A labelled group, not an ARIA toolbar: native controls keep normal Tab behaviour. */
export function FilterBar({
  label,
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { label: string }) {
  return (
    <div
      {...props}
      role="group"
      aria-label={label}
      data-slot="filter-bar"
      className={`ds-filter-bar ${className}`}
    >
      {children}
    </div>
  );
}
export function FilterActions({ children }: { children: ReactNode }) {
  return (
    <div className="ds-filter-actions" data-slot="filter-actions">
      {children}
    </div>
  );
}
export function FilterDisclosure({
  children,
  active = false,
  label = "More filters",
}: {
  children: ReactNode;
  active?: boolean;
  label?: string;
}) {
  return (
    <details className="ds-filter-disclosure" open={active || undefined}>
      <summary>{label}</summary>
      {children}
    </details>
  );
}
