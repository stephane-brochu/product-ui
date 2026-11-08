"use client";
import * as Primitive from "@radix-ui/react-dialog";
import { useState, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { Button, IconButton } from "./button";
import { usePortalContainer } from "./theme-boundary";
export type DialogProps = {
  title: ReactNode;
  description: ReactNode;
  trigger?: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  drawer?: boolean;
  size?: "default" | "wide";
  closeLabel?: string;
  dismissible?: boolean;
  className?: string;
  onCloseAutoFocus?: Primitive.DialogContentProps["onCloseAutoFocus"];
  contentProps?: Omit<
    ComponentPropsWithoutRef<typeof Primitive.Content>,
    "children" | "asChild" | "title"
  >;
};
export function Dialog({
  title,
  description,
  trigger,
  children,
  open,
  defaultOpen,
  onOpenChange,
  drawer = false,
  size = "default",
  closeLabel = "Close dialog",
  dismissible = true,
  className = "",
  onCloseAutoFocus,
  contentProps = {},
}: DialogProps) {
  const container = usePortalContainer();
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  return (
    <Primitive.Root
      open={open ?? internalOpen}
      onOpenChange={(next) => {
        if (next || dismissible) {
          setInternalOpen(next);
          onOpenChange?.(next);
        }
      }}
    >
      {trigger && <Primitive.Trigger asChild>{trigger}</Primitive.Trigger>}
      {container !== null && (
        <Primitive.Portal container={container}>
          <Primitive.Overlay className="ds-overlay" />
          <Primitive.Content
            {...contentProps}
            className={`ds-dialog ${drawer ? "ds-drawer" : ""} ${className} ${contentProps.className ?? ""}`}
            data-size={size}
            onCloseAutoFocus={onCloseAutoFocus ?? contentProps.onCloseAutoFocus}
            onEscapeKeyDown={(event) => {
              contentProps.onEscapeKeyDown?.(event);
              if (!dismissible) event.preventDefault();
            }}
            onPointerDownOutside={(event) => {
              contentProps.onPointerDownOutside?.(event);
              if (!dismissible) event.preventDefault();
            }}
          >
            <div className="ds-dialog-header">
              <Primitive.Title>{title}</Primitive.Title>
              <Primitive.Close asChild>
                <IconButton
                  variant="tertiary"
                  label={closeLabel}
                  disabled={!dismissible}
                >
                  ×
                </IconButton>
              </Primitive.Close>
            </div>
            <Primitive.Description className="ds-dialog-description">
              {description}
            </Primitive.Description>
            {children}
          </Primitive.Content>
        </Primitive.Portal>
      )}
    </Primitive.Root>
  );
}
export function Drawer(props: Omit<DialogProps, "drawer">) {
  return <Dialog {...props} drawer />;
}
export function DialogClose({
  children,
  ...props
}: ComponentPropsWithoutRef<typeof Button>) {
  return (
    <Primitive.Close asChild>
      <Button {...props}>{children}</Button>
    </Primitive.Close>
  );
}
