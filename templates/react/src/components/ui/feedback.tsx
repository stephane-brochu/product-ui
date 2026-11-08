import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Button } from "./button";
export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";
const marks: Record<StatusTone, string> = {
  neutral: "○",
  info: "i",
  success: "✓",
  warning: "!",
  danger: "!",
};
export function StatusBadge({
  children,
  tone = "neutral",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"span"> & { tone?: StatusTone }) {
  return (
    <span
      {...props}
      data-tone={tone}
      className={`ds-status ds-status-badge ${className}`}
    >
      <span aria-hidden="true">{marks[tone]}</span>
      {children}
    </span>
  );
}
/** Compatibility helper: emphasis means importance, not a financial severity. */
export function StatusLabel({
  children,
  emphasis = false,
}: {
  children: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <StatusBadge className={emphasis ? "ds-status--strong" : ""}>
      {children}
    </StatusBadge>
  );
}
export function InlineAlert({
  title,
  children,
  error = false,
  tone,
  action,
  className = "",
  ...props
}: Omit<ComponentPropsWithoutRef<"div">, "title"> & {
  title: ReactNode;
  error?: boolean;
  tone?: StatusTone;
  action?: ReactNode;
}) {
  const intent = tone ?? (error ? "danger" : "neutral");
  return (
    <div
      {...props}
      className={`ds-alert ${className}`}
      data-tone={intent}
      role={props.role ?? (error || intent === "danger" ? "alert" : "note")}
    >
      <strong>{title}</strong>
      <div>{children}</div>
      {action && <div className="ds-feedback-actions">{action}</div>}
    </div>
  );
}
export function ValidationMessage({
  children,
  ...props
}: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      {...props}
      className={`ds-validation ${props.className ?? ""}`}
      role="alert"
    >
      {children}
    </p>
  );
}
export function LoadingIndicator({ label = "Loading" }: { label?: string }) {
  return (
    <span className="ds-loading" role="status">
      <span className="ds-spinner" aria-hidden="true" />
      {label}
    </span>
  );
}
export function ProgressIndicator({
  value,
  label,
  max = 100,
}: {
  value?: number;
  label: string;
  max?: number;
}) {
  const boundedMax = Number.isFinite(max) && max > 0 ? max : 100;
  const progress =
    value !== undefined && Number.isFinite(value)
      ? Math.min(boundedMax, Math.max(0, value))
      : undefined;
  return (
    <label className="ds-progress">
      {label}
      <progress max={boundedMax} value={progress} aria-label={label} />
      <span aria-hidden="true">
        {progress === undefined
          ? "In progress"
          : `${Math.round((progress / boundedMax) * 100)}%`}
      </span>
    </label>
  );
}
type StateProps = {
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  className?: string;
};
export function EmptyState({
  title,
  children,
  action,
  headingLevel = 3,
  className = "",
}: StateProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <div className={`ds-empty ${className}`}>
      <span className="ds-empty-mark" aria-hidden="true">
        —
      </span>
      <Heading>{title}</Heading>
      <div className="ds-empty-description">{children}</div>
      {action && <div className="ds-feedback-actions">{action}</div>}
    </div>
  );
}
export function ErrorState({
  title = "Unable to load this information",
  children,
  action,
  onRetry,
  headingLevel = 3,
  className = "",
}: Omit<StateProps, "title"> & { title?: ReactNode; onRetry?: () => void }) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <div className={`ds-empty ds-error-state ${className}`} role="alert">
      <Heading>{title}</Heading>
      <div className="ds-empty-description">
        {children ?? "Please try again."}
      </div>
      {(action || onRetry) && (
        <div className="ds-feedback-actions">
          {action ?? (
            <Button variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
/** Presentational notification; the caller owns its queue and lifetime. */
export function ToastNotification({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="ds-toast" role="status" aria-live="polite">
      <span>{message}</span>
      <Button
        variant="tertiary"
        size="compact"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        Dismiss
      </Button>
    </div>
  );
}
