import type { ComponentPropsWithRef, ReactNode } from "react";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "compact" | "default" | "large";
  loading?: boolean;
};
export function buttonClassName({
  variant = "primary",
  size = "default",
  className = "",
}: Pick<ButtonProps, "variant" | "size" | "className"> = {}) {
  return `ds-button ds-button--${variant} ds-button--${size} ${className}`;
}

export function Button({
  variant = "primary",
  size = "default",
  loading = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={buttonClassName({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && <span className="ds-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
export function IconButton({
  label,
  children,
  ...props
}: Omit<ButtonProps, "children"> & { label: string; children: ReactNode }) {
  return (
    <Button
      {...props}
      className={`ds-icon-button ${props.className ?? ""}`}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}
export function ButtonGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="ds-button-group" role="group" aria-label={label}>
      {children}
    </div>
  );
}
