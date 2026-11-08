"use client";
import * as Primitive from "@radix-ui/react-popover";
import type { ComponentPropsWithRef, ReactNode, ReactElement } from "react";
import { Button } from "./button";
import { usePortalContainer } from "./theme-boundary";
export type PopoverProps = {
  title: string;
  trigger: ReactElement;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  contentProps?: Omit<
    ComponentPropsWithRef<typeof Primitive.Content>,
    "children" | "asChild"
  >;
};
export function Popover({
  title,
  trigger,
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal = false,
  contentProps = {},
}: PopoverProps) {
  const container = usePortalContainer();
  return (
    <Primitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      <Primitive.Trigger asChild>{trigger}</Primitive.Trigger>
      {container !== null && (
        <Primitive.Portal container={container}>
          <Primitive.Content
            sideOffset={8}
            collisionPadding={16}
            {...contentProps}
            className={`ds-popover ${contentProps.className ?? ""}`}
            aria-label={title}
          >
            {children}
          </Primitive.Content>
        </Primitive.Portal>
      )}
    </Primitive.Root>
  );
}
export function PopoverClose({
  children,
  ...props
}: ComponentPropsWithRef<typeof Button>) {
  return (
    <Primitive.Close asChild>
      <Button {...props}>{children}</Button>
    </Primitive.Close>
  );
}
