"use client";
import { useId, type ReactNode } from "react";
import { Popover } from "./popover";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
export type MultiSelectOption = { value: string; label: string; disabled?: boolean };
export function MultiSelect({ label, options, values, onValueChange, allLabel = "All options", emptyLabel = "No options selected", emptyMessage = "No options available.", itemLabel = "option", itemLabelPlural = "options", disabled = false, name, error }: {
  label: string; options: readonly MultiSelectOption[]; values: readonly string[]; onValueChange: (values: string[]) => void;
  allLabel?: string; emptyLabel?: string; emptyMessage?: string; itemLabel?: string; itemLabelPlural?: string; disabled?: boolean; name?: string; error?: ReactNode;
}) {
  const id = useId(), unique = [...new Map(options.map(option => [option.value, option])).values()];
  const selected = unique.filter(option => values.includes(option.value)), enabled = unique.filter(option => !option.disabled);
  const all = enabled.length > 0 && enabled.every(option => values.includes(option.value));
  const some = enabled.some(option => values.includes(option.value));
  const summary = selected.length === 0 ? emptyLabel : selected.length === unique.length ? allLabel : selected.length === 1 ? selected[0].label : `${selected.length} ${itemLabelPlural}`;
  function toggle(value: string, checked: boolean) {
    const next = new Set(selected.map(option => option.value));
    if (checked) next.add(value); else next.delete(value);
    onValueChange(unique.filter(option => next.has(option.value)).map(option => option.value));
  }
  return <div className="ds-multi-select">
    <span id={`${id}-label`} className="ds-control-label">{label}</span>
    <Popover title={label} trigger={<Button variant="secondary" disabled={disabled} aria-labelledby={`${id}-label ${id}-summary`} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `${id}-error` : undefined}>
      <span id={`${id}-summary`}>{summary}</span><span aria-hidden="true"> ▾</span>
    </Button>}>
      <fieldset className="ds-multi-select-options" disabled={disabled}><legend className="ds-sr-only">{label}</legend>
        {unique.length > 0 ? <Checkbox label={allLabel} checked={all} indeterminate={some && !all} disabled={enabled.length === 0}
          onChange={event => {
            const next = new Set(selected.map(option => option.value));
            for (const option of enabled) { if (event.target.checked) next.add(option.value); else next.delete(option.value); }
            onValueChange(unique.filter(option => next.has(option.value)).map(option => option.value));
          }} /> : <p>{emptyMessage}</p>}
        {unique.map(option => <Checkbox key={option.value} label={option.label} checked={values.includes(option.value)} disabled={option.disabled} onChange={event => toggle(option.value, event.target.checked)} />)}
      </fieldset>
    </Popover>
    {name && selected.map(option => <input key={option.value} type="hidden" name={name} value={option.value} disabled={disabled} />)}
    {error && <p id={`${id}-error`} role="alert" className="ds-validation">{error}</p>}
    <span className="ds-sr-only" aria-live="polite">{selected.length} {selected.length === 1 ? itemLabel : itemLabelPlural} selected</span>
  </div>;
}
