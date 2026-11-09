"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "./button";
import { FormField, TextInput, type SelectOption } from "./fields";
import { Popover } from "./popover";
import { RadioGroup } from "./selection";

export type CreatableSelectProps = {
  label: string;
  name?: string;
  value: string;
  options: readonly SelectOption[];
  onValueChange: (value: string) => void;
  onCreate: (label: string) => Promise<SelectOption>;
  createLabel?: string;
  createInputLabel?: string;
  placeholder?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  onPendingChange?: (pending: boolean) => void;
};

/** A small native-radio chooser in a dialog popup, with callback-owned creation. */
export function CreatableSelect({
  label,
  name,
  value,
  options,
  onValueChange,
  onCreate,
  createLabel = "Create option",
  createInputLabel = "New option name",
  placeholder = "Choose an option",
  description,
  error,
  required = false,
  disabled = false,
  maxLength = 100,
  onPendingChange,
}: CreatableSelectProps) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  const inFlight = useRef(false);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [created, setCreated] = useState<SelectOption[]>([]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (creating) input.current?.focus();
  }, [creating]);
  const known = new Map(created.map((option) => [option.value, option]));
  for (const option of options) known.set(option.value, option);
  const available = [...known.values()];
  if (
    options.some(
      (option, index) =>
        !option.value ||
        options.findIndex((other) => other.value === option.value) !== index,
    )
  )
    throw new Error("CreatableSelect requires unique non-empty option values");
  const selected = known.get(value);
  const selection = selected && !selected.disabled ? value : "";
  const fieldError =
    error ?? (invalid && !selection ? "Choose an option." : undefined);
  const describedBy =
    [description && `${id}-description`, fieldError && `${id}-error`]
      .filter(Boolean)
      .join(" ") || undefined;
  function changeOpen(next: boolean) {
    if (inFlight.current) return;
    setOpen(next);
    if (!next) setCreating(false);
  }
  function choose(next: string) {
    setInvalid(false);
    onValueChange(next);
    setOpen(false);
    setCreating(false);
  }
  async function create() {
    const text = draft.trim();
    if (!text || disabled || inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setFailure("");
    onPendingChange?.(true);
    try {
      const option = await onCreate(text);
      if (!option.value || !option.label || option.disabled)
        throw new Error("The new option could not be selected.");
      if (!mounted.current) return;
      setCreated((current) => [
        ...current.filter((item) => item.value !== option.value),
        option,
      ]);
      choose(option.value);
      setDraft("");
    } catch (reason) {
      if (mounted.current)
        setFailure(
          reason instanceof Error
            ? reason.message
            : "Could not create the option. Try again.",
        );
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setPending(false);
        onPendingChange?.(false);
      }
    }
  }
  return (
    <FormField
      id={id}
      label={label}
      description={description}
      error={fieldError}
      className="ds-creatable-select"
    >
      {/* This native control owns FormData and required validation, including when the popup is closed. */}
      <select
        className="ds-sr-only"
        aria-hidden="true"
        aria-label={label}
        tabIndex={-1}
        name={name}
        required={required}
        disabled={disabled}
        value={selection}
        onChange={(event) => choose(event.target.value)}
        onInvalid={(event) => {
          event.preventDefault();
          setInvalid(true);
          trigger.current?.focus();
        }}
      >
        <option value="">{placeholder}</option>
        {available.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      <Popover
        title={label}
        open={open}
        onOpenChange={changeOpen}
        trigger={
          <Button
            id={id}
            ref={trigger}
            role="combobox"
            aria-label={label}
            aria-haspopup="dialog"
            aria-required={required || undefined}
            aria-invalid={!!fieldError || undefined}
            aria-describedby={describedBy}
            variant="secondary"
            className="ds-creatable-trigger"
            disabled={disabled}
          >
            <span>{selected?.label ?? placeholder}</span>
            <span aria-hidden="true">⌄</span>
          </Button>
        }
        contentProps={{
          className: "ds-creatable-popup",
          onEscapeKeyDown: (event) => {
            if (inFlight.current) event.preventDefault();
          },
          onInteractOutside: (event) => {
            if (inFlight.current) event.preventDefault();
          },
        }}
      >
        {creating ? (
          <div className="ds-creatable-editor" aria-busy={pending || undefined}>
            <TextInput
              ref={input}
              label={createInputLabel}
              value={draft}
              maxLength={maxLength}
              disabled={pending}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.stopPropagation();
                  void create();
                }
              }}
            />
            {failure && (
              <p role="alert" className="ds-validation">
                {failure}
              </p>
            )}
            <div className="ds-button-group">
              <Button
                onClick={() => void create()}
                loading={pending}
                disabled={!draft.trim()}
              >
                {createLabel}
              </Button>
              <Button
                variant="tertiary"
                disabled={pending}
                onClick={() => {
                  setCreating(false);
                  setFailure("");
                }}
              >
                Cancel
              </Button>
            </div>
            {pending && <p role="status">Creating…</p>}
          </div>
        ) : (
          <>
            <RadioGroup
              label={label}
              options={available}
              value={selection}
              onValueChange={choose}
              disabled={disabled}
            />
            <Button
              variant="tertiary"
              className="ds-creatable-add"
              disabled={disabled}
              onClick={() => {
                setCreating(true);
                setFailure("");
              }}
            >
              {createLabel}
            </Button>
          </>
        )}
      </Popover>
    </FormField>
  );
}
