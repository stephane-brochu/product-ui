"use client";
import { useRef, useState, type ReactNode } from "react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { FormFeedback } from "./form-feedback";

export function ConfirmationDialog({
  title,
  description,
  trigger,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  pendingLabel = "Working…",
  errorMessage = "The action could not be completed. Please try again.",
  onConfirm,
}: {
  title: ReactNode;
  description: ReactNode;
  trigger: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  errorMessage?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const inFlight = useRef(false),
    cancel = useRef<HTMLButtonElement>(null);
  async function confirm() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      setError(errorMessage);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={title}
      description={description}
      trigger={trigger}
      open={open}
      dismissible={!busy}
      onOpenChange={(next) => {
        if (!inFlight.current) {
          setOpen(next);
          setError("");
        }
      }}
      contentProps={{
        onOpenAutoFocus: (event) => {
          event.preventDefault();
          cancel.current?.focus();
        },
      }}
    >
      <FormFeedback
        pending={busy}
        error={error}
        pendingMessage={pendingLabel}
      />
      <div className="ds-dialog-actions">
        <Button
          ref={cancel}
          variant="secondary"
          disabled={busy}
          onClick={() => setOpen(false)}
        >
          {cancelLabel}
        </Button>
        <Button variant="destructive" loading={busy} onClick={confirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
