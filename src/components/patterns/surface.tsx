import type { ComponentPropsWithRef, ReactNode } from "react";
import { Button, type ButtonProps } from "../ui/button";
import type { StatusTone } from "../ui/feedback";

export function SurfaceCard({ className = "", ...props }: ComponentPropsWithRef<"section">) {
  return <section {...props} className={`ds-surface-card ${className}`} />;
}
export function Stack({ gap = "md", className = "", ...props }: ComponentPropsWithRef<"div"> & { gap?: "sm" | "md" | "lg" }) {
  return <div {...props} className={`ds-stack ${className}`} data-gap={gap} />;
}
export function Inline({ className = "", ...props }: ComponentPropsWithRef<"div">) {
  return <div {...props} className={`ds-inline ${className}`} />;
}
export function StatusIndicator({ label, tone = "neutral", showLabel = false }: { label: string; tone?: StatusTone; showLabel?: boolean }) {
  return <span className="ds-status-indicator" data-tone={tone}>
    <span className="ds-status-dot" role={showLabel ? undefined : "img"} aria-label={showLabel ? undefined : label} aria-hidden={showLabel || undefined} title={label} />
    {showLabel && <span>{label}</span>}
  </span>;
}
/** Interactive row: a real button, with product-owned text and trailing status. */
export function ActionRow({ children, trailing, className = "", ...props }: ButtonProps & { trailing?: ReactNode }) {
  return <Button {...props} variant="tertiary" className={`ds-action-row ${className}`}><span className="ds-action-row-content">{children}</span>{trailing}</Button>;
}
