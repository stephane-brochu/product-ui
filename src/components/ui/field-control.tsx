"use client";
import { createContext, useContext, useId, type ComponentPropsWithRef, type ReactNode } from "react";
type FieldContext = { id: string; description?: string; invalid?: boolean };
const Context = createContext<FieldContext | undefined>(undefined);
/** One labelled native control per field. Composite controls provide their own group label. */
export function ControlField({ label, description, error, children, id: suppliedId, className = "" }: {
  label: ReactNode; description?: ReactNode; error?: ReactNode; children: ReactNode; id?: string; className?: string;
}) {
  const generated = useId(), id = suppliedId ?? generated;
  const described = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return <Context.Provider value={{ id, description: described, invalid: Boolean(error) }}><div className={`ds-field ${className}`}>
    <label htmlFor={id}>{label}</label>{children}
    {description && <p className="ds-field-description" id={`${id}-description`}>{description}</p>}
    {error && <p className="ds-validation" id={`${id}-error`} role="alert">{error}</p>}
  </div></Context.Provider>;
}
function useControl(props: { id?: string; "aria-describedby"?: string; "aria-invalid"?: ComponentPropsWithRef<"input">["aria-invalid"] }) {
  const field = useContext(Context);
  return { id: props.id ?? field?.id, "aria-describedby": [field?.description, props["aria-describedby"]].filter(Boolean).join(" ") || undefined,
    "aria-invalid": field?.invalid || props["aria-invalid"] || undefined };
}
export function InputControl({ mono, segment = "plain", className = "", ...props }: ComponentPropsWithRef<"input"> & { mono?: boolean; segment?: "plain" | "left" | "right" }) {
  const attributes = useControl(props);
  return <input {...props} {...attributes} className={`ds-input ds-native-control ${className}`} data-mono={mono || undefined} data-segment={segment} />;
}
export function TextareaControl({ className = "", ...props }: ComponentPropsWithRef<"textarea">) {
  const attributes = useControl(props);
  return <textarea {...props} {...attributes} className={`ds-input ds-native-control ${className}`} />;
}
export function SelectControl({ className = "", ...props }: ComponentPropsWithRef<"select">) {
  const attributes = useControl(props);
  return <select {...props} {...attributes} className={`ds-select ds-native-control ${className}`} />;
}
