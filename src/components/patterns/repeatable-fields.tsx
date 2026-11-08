"use client";
import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { Button } from "../ui/button";
export type RepeatableFieldItem = {
  id: string;
  content: ReactNode;
  label: string;
};
/** Stable IDs and values/serialization belong to the caller. */
export function RepeatableFields({
  label,
  items,
  onAdd,
  onRemove,
  addLabel = "Add row",
  removeLabel = "Remove",
  maxItems,
  minItems = 0,
  disabled = false,
  emptyMessage = "No rows added.",
}: {
  label: string;
  items: readonly RepeatableFieldItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  addLabel?: string;
  removeLabel?: string;
  minItems?: number;
  maxItems?: number;
  disabled?: boolean;
  emptyMessage?: ReactNode;
}) {
  const root = useRef<HTMLFieldSetElement>(null),
    add = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<{ kind: "add" | "remove"; index: number } | null>(
    null,
  );
  const id = useId();
  if (
    new Set(items.map((item) => item.id)).size !== items.length ||
    items.some((item) => !item.id)
  )
    throw new Error("Repeatable fields require unique nonempty IDs");
  if (
    !Number.isInteger(minItems) ||
    minItems < 0 ||
    (maxItems !== undefined &&
      (!Number.isInteger(maxItems) || maxItems < minItems))
  )
    throw new Error("Invalid repeatable field limits");
  useLayoutEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    pendingFocus.current = null;
    const rows = root.current?.querySelectorAll<HTMLElement>(
      "[data-repeatable-row]",
    );
    const row = rows?.[Math.min(pending.index, (rows?.length ?? 0) - 1)];
    const focusable = row?.querySelector<HTMLElement>(
      pending.kind === "remove"
        ? "button[data-remove]:not(:disabled)"
        : "input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled)",
    );
    (focusable ?? add.current)?.focus();
  }, [items]);
  return (
    <fieldset ref={root} disabled={disabled} className="ds-repeatable-fields">
      <legend>{label}</legend>
      {!items.length && <p>{emptyMessage}</p>}
      {items.map((item, index) => (
        <fieldset
          key={item.id}
          data-repeatable-row
          className="ds-repeatable-row"
        >
          <legend>{item.label}</legend>
          <div className="ds-repeatable-content">{item.content}</div>
          <Button
            data-remove
            variant="tertiary"
            aria-label={`${removeLabel} ${item.label}`}
            disabled={disabled || items.length <= minItems}
            onClick={() => {
              pendingFocus.current = { kind: "remove", index };
              onRemove(item.id);
            }}
          >
            {removeLabel}
          </Button>
        </fieldset>
      ))}
      <Button
        ref={add}
        variant="secondary"
        aria-describedby={maxItems !== undefined ? `${id}-limit` : undefined}
        disabled={
          disabled || (maxItems !== undefined && items.length >= maxItems)
        }
        onClick={() => {
          pendingFocus.current = { kind: "add", index: items.length };
          onAdd();
        }}
      >
        {addLabel}
      </Button>
      {maxItems !== undefined && (
        <p id={`${id}-limit`} className="ds-workflow-caption">
          {items.length} of {maxItems} rows
        </p>
      )}
    </fieldset>
  );
}
