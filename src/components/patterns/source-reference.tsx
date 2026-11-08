import type { ComponentPropsWithRef, ReactNode } from "react";
export type SourceReferenceProps = Omit<
  ComponentPropsWithRef<"a">,
  "children"
> & { href: string; label: ReactNode; detail?: ReactNode };
export function SourceReference({
  label,
  detail,
  target,
  rel,
  className = "",
  ...props
}: SourceReferenceProps) {
  return (
    <span className={`ds-source-reference ${className}`}>
      <a
        {...props}
        target={target}
        rel={
          target === "_blank"
            ? [rel, "noopener", "noreferrer"].filter(Boolean).join(" ")
            : rel
        }
      >
        {label}
        {target === "_blank" && (
          <>
            {" "}
            <span className="ds-data-sr-only">(opens in a new tab)</span>
          </>
        )}
      </a>
      {detail && <span className="ds-source-detail">{detail}</span>}
    </span>
  );
}
