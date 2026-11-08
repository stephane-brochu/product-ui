"use client";
import { useRef, useEffect, useImperativeHandle } from "react";
import { Disclosure, type DisclosureProps } from "./disclosure";
export type ControlledDisclosureProps = Omit<
  DisclosureProps,
  "defaultOpen" | "onToggle" | "name"
> & { open: boolean; onOpenChange: (open: boolean) => void };
/** Controlled expansion for validation reveal. Native exclusive name groups are deliberately excluded. */
export function ControlledDisclosure({
  open,
  onOpenChange,
  onClick,
  ref,
  ...props
}: ControlledDisclosureProps) {
  const details = useRef<HTMLDetailsElement>(null);
  useImperativeHandle(ref, () => details.current!, []);
  useEffect(() => {
    const el = details.current;
    if (!open && el && el.contains(document.activeElement)) {
      el.querySelector("summary")?.focus();
    }
  }, [open]);
  return (
    <Disclosure
      {...props}
      ref={details}
      defaultOpen={open}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const summary = (event.target as Element).closest("summary");
        if (summary?.parentElement === event.currentTarget) {
          event.preventDefault();
          onOpenChange(!open);
        }
      }}
    />
  );
}
