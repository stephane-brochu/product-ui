"use client";
import { useId, useRef, useState } from "react";
import { Button } from "./button";
export type OrderedItem = { value: string; label: string };
export function ReorderableList({ label, items, onChange, name, disabled = false, emptyMessage = "No items to order." }: {
  label: string; items: readonly OrderedItem[]; onChange: (items: OrderedItem[]) => void; name?: string; disabled?: boolean; emptyMessage?: string;
}) {
  const id = useId(), refs = useRef(new Map<string, HTMLButtonElement>()), [announcement, setAnnouncement] = useState("");
  if (new Set(items.map(item => item.value)).size !== items.length) throw new Error("Ordered item values must be unique.");
  function move(index: number, delta: number) {
    if (disabled || index + delta < 0 || index + delta >= items.length) return;
    const next = [...items], item = next[index];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    onChange(next); setAnnouncement(`${item.label} moved to position ${index + delta + 1} of ${items.length}.`);
    // aria-disabled retains the initiating button's focus when it reaches a boundary.
    refs.current.get(`${item.value}:${delta}`)?.focus();
  }
  return <div className="ds-reorderable"><p id={id} className="ds-control-label">{label}</p>
    {items.length ? <ol aria-labelledby={id}>{items.map((item, index) => <li key={item.value}>
      <span>{item.label}</span><div className="ds-reorder-actions">
        {([-1, 1] as const).map(delta => <Button key={delta} variant="secondary" size="compact" disabled={disabled}
          ref={node => { if (node) refs.current.set(`${item.value}:${delta}`, node); else refs.current.delete(`${item.value}:${delta}`); }}
          aria-label={`Move ${item.label} ${delta < 0 ? "up" : "down"}`} aria-disabled={disabled || index + delta < 0 || index + delta >= items.length}
          onClick={() => move(index, delta)}>{delta < 0 ? "↑ Up" : "↓ Down"}</Button>)}
      </div>{name && <input type="hidden" name={name} value={item.value} disabled={disabled} />}
    </li>)}</ol> : <p>{emptyMessage}</p>}
    <span className="ds-sr-only" role="status">{announcement}</span>
  </div>;
}
