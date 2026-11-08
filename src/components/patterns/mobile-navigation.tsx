"use client";
import { useId, useRef, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { NavigationLinks, type NavigationProps } from "./navigation";

/** navigationKey must change on product route changes (including programmatic navigation). */
export function MobileNavigation({
  navigationKey,
  ...props
}: NavigationProps & { navigationKey?: string }) {
  return (
    <MobileDisclosure key={navigationKey ?? props.activeHref} {...props} />
  );
}
function MobileDisclosure({
  label = "Mobile primary",
  ...props
}: NavigationProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  return (
    <div
      ref={root}
      className="ds-mobile-navigation"
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget as Node)
        )
          setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <Button
        ref={trigger}
        variant="tertiary"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {open ? "Close" : "Menu"}
        <span aria-hidden="true"> {open ? "×" : "+"}</span>
      </Button>
      <nav id={id} hidden={!open} aria-label={label}>
        <NavigationLinks {...props} onNavigate={() => setOpen(false)} />
      </nav>
    </div>
  );
}
