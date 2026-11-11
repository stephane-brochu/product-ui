"use client";
import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { Checkbox, type CheckboxProps } from "./checkbox";
export type ChoiceOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  description?: ReactNode;
};
export type RadioGroupProps = Omit<
  ComponentPropsWithRef<"fieldset">,
  "children" | "onChange" | "defaultValue"
> & {
  label: ReactNode;
  options: readonly ChoiceOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  emptyMessage?: ReactNode;
  labelHidden?: boolean;
  appearance?: "solid" | "pill";
};
function Choices({
  label,
  options,
  value,
  defaultValue = "",
  onValueChange,
  name,
  required,
  description,
  error,
  emptyMessage = "No options available.",
  labelHidden = false,
  appearance = "solid",
  id: providedId,
  className = "",
  segmented = false,
  ...props
}: RadioGroupProps & { segmented?: boolean }) {
  const generated = useId(),
    id = providedId ?? generated;
  const described =
    [
      description && `${id}-description`,
      error && `${id}-error`,
      props["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <fieldset
      {...props}
      id={id}
      name={name}
      className={`ds-choice-group ${segmented ? "ds-segmented" : ""} ${className}`}
      aria-describedby={described}
      aria-invalid={error ? true : props["aria-invalid"]}
      data-appearance={appearance}
    >
      <legend className={labelHidden ? "ds-sr-only" : undefined}>{label}</legend>
      {description && (
        <p id={`${id}-description`} className="ds-field-description">
          {description}
        </p>
      )}
      <div className="ds-choice-options">
        {options.map((option, index) => (
          <label
            key={option.value}
            className="ds-choice"
            htmlFor={`${id}-${index}`}
          >
            <input
              type="radio"
              id={`${id}-${index}`}
              name={name ?? id}
              value={option.value}
              checked={value !== undefined ? value === option.value : undefined}
              defaultChecked={
                value === undefined ? defaultValue === option.value : undefined
              }
              required={required}
              disabled={option.disabled}
              aria-labelledby={`${id}-${index}-label`}
              aria-describedby={
                [described, option.description && `${id}-${index}-description`]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              onChange={() => {
                onValueChange?.(option.value);
              }}
            />
            <span>
              <span id={`${id}-${index}-label`}>{option.label}</span>
              {option.description && (
                <span
                  id={`${id}-${index}-description`}
                  className="ds-choice-description"
                >
                  {option.description}
                </span>
              )}
            </span>
          </label>
        ))}
        {options.length === 0 && (
          <p className="ds-field-description">{emptyMessage}</p>
        )}
      </div>
      {error && (
        <p role="alert" id={`${id}-error`} className="ds-validation">
          {error}
        </p>
      )}
    </fieldset>
  );
}
export function RadioGroup(props: RadioGroupProps) {
  return <Choices {...props} />;
}
/** A single-choice radio group, visually segmented; not navigation or independent toggles. */
export function SegmentedControl(props: RadioGroupProps) {
  return <Choices {...props} segmented />;
}
export type SwitchProps = Omit<
  CheckboxProps,
  "indeterminate" | "role" | "aria-checked" | "readOnly"
>;
export function Switch({ fieldClassName = "", ...props }: SwitchProps) {
  return (
    <Checkbox
      {...props}
      role="switch"
      fieldClassName={`ds-switch ${fieldClassName}`}
    />
  );
}
