"use client";
import {
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";

type FieldProps = {
  label: string;
  description?: string;
  error?: string;
  id: string;
  children: ReactNode;
  className?: string;
};
export function FormField({
  label,
  description,
  error,
  id,
  children,
  className = "",
}: FieldProps) {
  return (
    <div className={`ds-field ${className}`}>
      <label htmlFor={id}>{label}</label>
      {children}
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
export type TextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "prefix"
> & {
  label: string;
  description?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  fieldClassName?: string;
};
export function TextInput({
  label,
  description,
  error,
  prefix,
  suffix,
  fieldClassName,
  id: providedId,
  className = "",
  ...props
}: TextInputProps) {
  const autoId = useId();
  const id = providedId ?? autoId;
  const descriptions =
    [
      description && `${id}-description`,
      error && `${id}-error`,
      props["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <FormField
      label={label}
      description={description}
      error={error}
      id={id}
      className={fieldClassName}
    >
      <div
        className={`ds-input-shell ${error ? "ds-input-shell--invalid" : ""}`}
      >
        {prefix && <span className="ds-input-affix">{prefix}</span>}
        <input
          {...props}
          id={id}
          data-slot="input"
          className={`ds-input ${className}`}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={descriptions}
        />
        {suffix && <span className="ds-input-affix">{suffix}</span>}
      </div>
    </FormField>
  );
}
export function NumberInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      type="number"
      step={props.step ?? "any"}
      inputMode="decimal"
    />
  );
}
/** String in, string out. No parseFloat, valueAsNumber or numeric coercion. */
export function CurrencyInput({
  currency = "CAD",
  value,
  onValueChange,
  ...props
}: Omit<TextInputProps, "type" | "value" | "onChange"> & {
  currency?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <TextInput
      {...props}
      type="text"
      inputMode="decimal"
      pattern="-?[0-9]+([.][0-9]+)?"
      prefix={currency}
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
    />
  );
}
export function SearchInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      type="search"
      prefix={<span aria-hidden="true">⌕</span>}
    />
  );
}
export type SelectOption = {
  value: string;
  label: string;
  group?: string;
  disabled?: boolean;
};
export function Select({
  label,
  description,
  error,
  options,
  id: suppliedId,
  className = "",
  fieldClassName,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  description?: string;
  error?: string;
  options: SelectOption[];
  fieldClassName?: string;
}) {
  const autoId = useId();
  const id = suppliedId ?? autoId;
  const grouped = options.some((option) => option.group);
  const groups = [...new Set(options.map((option) => option.group ?? "Other"))];
  const optionNode = (option: SelectOption) => (
    <option key={option.value} value={option.value} disabled={option.disabled}>
      {option.label}
    </option>
  );
  return (
    <FormField
      label={label}
      id={id}
      description={description}
      error={error}
      className={fieldClassName}
    >
      <select
        {...props}
        id={id}
        data-slot="select"
        className={`ds-select ${className}`}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={
          [
            description && `${id}-description`,
            error && `${id}-error`,
            props["aria-describedby"],
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
      >
        {grouped
          ? groups.map((group) => (
              <optgroup key={group} label={group}>
                {options
                  .filter((option) => (option.group ?? "Other") === group)
                  .map(optionNode)}
              </optgroup>
            ))
          : options.map(optionNode)}
      </select>
    </FormField>
  );
}
export function DatePicker(props: Omit<TextInputProps, "type">) {
  return <TextInput {...props} type="date" />;
}
export function MonthPicker(props: Omit<TextInputProps, "type">) {
  return <TextInput {...props} type="month" pattern="[0-9]{4}-[0-9]{2}" />;
}
