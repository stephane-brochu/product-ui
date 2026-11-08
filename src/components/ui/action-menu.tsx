"use client";
import * as Primitive from "@radix-ui/react-dropdown-menu";
import type { ReactElement, ComponentPropsWithRef } from "react";
import { Button } from "./button";
import { usePortalContainer } from "./theme-boundary";
export type MenuAction = {
  id: string;
  label: string;
  onSelect: (event: Event) => void;
  disabled?: boolean;
  destructive?: boolean;
};
export type DropdownActionMenuProps = {
  label?: string;
  trigger?: ReactElement;
  actions: readonly MenuAction[];
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  emptyLabel?: string;
  contentProps?: Omit<
    ComponentPropsWithRef<typeof Primitive.Content>,
    "children" | "asChild"
  >;
};
export function DropdownActionMenu({
  label = "More actions",
  trigger,
  actions,
  disabled = false,
  open,
  defaultOpen,
  onOpenChange,
  emptyLabel = "No actions available",
  contentProps = {},
}: DropdownActionMenuProps) {
  const container = usePortalContainer();
  return (
    <Primitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <Primitive.Trigger asChild disabled={disabled}>
        {trigger ?? (
          <Button variant="secondary">
            {label} <span aria-hidden="true">⌄</span>
          </Button>
        )}
      </Primitive.Trigger>
      {container !== null && (
        <Primitive.Portal container={container}>
          <Primitive.Content
            sideOffset={6}
            collisionPadding={16}
            {...contentProps}
            className={`ds-menu ${contentProps.className ?? ""}`}
            aria-label={label}
          >
            {actions.map((action) => (
              <Primitive.Item
                className="ds-menu-item"
                key={action.id}
                disabled={action.disabled}
                onSelect={action.onSelect}
                data-destructive={action.destructive || undefined}
              >
                {action.label}
              </Primitive.Item>
            ))}
            {actions.length === 0 && (
              <Primitive.Item className="ds-menu-item" disabled>
                {emptyLabel}
              </Primitive.Item>
            )}
          </Primitive.Content>
        </Primitive.Portal>
      )}
    </Primitive.Root>
  );
}
