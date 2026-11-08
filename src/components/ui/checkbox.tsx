"use client";
import {
  useId,
  useEffect,
  useRef,
  useImperativeHandle,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
export type CheckboxProps = Omit<
  ComponentPropsWithRef<"input">,
  "type" | "children"
> & {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  indeterminate?: boolean;
  fieldClassName?: string;
};
export function Checkbox({
  label,
  description,
  error,
  indeterminate = false,
  id: providedId,
  ref,
  fieldClassName = "",
  ...props
}: CheckboxProps) {
  const generated = useId();
  const id = providedId ?? generated;
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => input.current!, []);
  useEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const described =
    [
      description && `${id}-description`,
      error && `${id}-error`,
      props["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className={`ds-check-field ${fieldClassName}`}>
      <label htmlFor={id} className="ds-check">
        <input
          {...props}
          ref={input}
          id={id}
          type="checkbox"
          aria-checked={indeterminate ? "mixed" : props.checked}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={described}
        />
        <span>{label}</span>
      </label>
      {description && (
        <p id={`${id}-description`} className="ds-field-description">
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="ds-validation" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
