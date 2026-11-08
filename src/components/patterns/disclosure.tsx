import type { ComponentPropsWithRef, ReactNode } from "react";
export type DisclosureProps = Omit<
  ComponentPropsWithRef<"details">,
  "title" | "children" | "open"
> & {
  title: ReactNode;
  children: ReactNode;
  count?: ReactNode;
  defaultOpen?: boolean;
};
/** Native expansion, including before hydration. Put actions in the body, never inside summary. */
export function Disclosure({
  title,
  children,
  count,
  defaultOpen = false,
  className = "",
  ...props
}: DisclosureProps) {
  return (
    <details
      {...props}
      open={defaultOpen}
      className={`ds-disclosure ${className}`}
    >
      <summary>
        {title}
        {count !== undefined && (
          <span className="ds-disclosure-count">{count}</span>
        )}
      </summary>
      <div className="ds-disclosure-content">{children}</div>
    </details>
  );
}
