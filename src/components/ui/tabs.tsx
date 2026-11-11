"use client";
import { useId, useRef, type ReactNode, type KeyboardEvent } from "react";
export type TabOption<T extends string> = { value: T; label: ReactNode; disabled?: boolean };
/** Controlled view switching. The caller supplies the active panel's content. */
export function Tabs<T extends string>({ label, value, onValueChange, options, children, activation = "automatic" }: {
  label: string; value: T; onValueChange: (value: T) => void; options: readonly TabOption<T>[]; children: ReactNode; activation?: "manual" | "automatic";
}) {
  const id = useId(), refs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = options.findIndex(option => option.value === value && !option.disabled);
  const focusIndex = active >= 0 ? active : options.findIndex(option => !option.disabled);
  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const enabled = options.map((option, i) => option.disabled ? -1 : i).filter(i => i >= 0);
    const current = enabled.indexOf(index);
    let next: number | undefined;
    if (event.key === "ArrowRight") next = enabled[(current + 1) % enabled.length];
    if (event.key === "ArrowLeft") next = enabled[(current - 1 + enabled.length) % enabled.length];
    if (event.key === "Home") next = enabled[0];
    if (event.key === "End") next = enabled.at(-1);
    if (next === undefined) return;
    event.preventDefault(); refs.current[next]?.focus();
    if (activation === "automatic") onValueChange(options[next].value);
  }
  return <div className="ds-tabs">
    <div className="ds-tab-list" role="tablist" aria-label={label}>
      {options.map((option, index) => <button key={option.value} ref={node => { refs.current[index] = node; }} type="button" role="tab"
        id={`${id}-tab-${index}`} aria-controls={`${id}-panel`} aria-selected={index === active} tabIndex={index === focusIndex ? 0 : -1}
        disabled={option.disabled} onKeyDown={event => move(event, index)} onClick={() => onValueChange(option.value)}>{option.label}</button>)}
    </div>
    {active >= 0 && <div className="ds-tab-panel" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} tabIndex={0}>{children}</div>}
  </div>;
}
