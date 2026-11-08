import type { ReactNode } from "react";

/** Presentation only: callers retain async state, focus policy, saving and retry logic. */
export function FormFeedback({
  pending,
  error,
  success,
  pendingMessage = "Saving…",
  onRetry,
  retryLabel = "Try again",
}: {
  pending?: boolean;
  error?: ReactNode;
  success?: ReactNode;
  pendingMessage?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="ds-form-feedback" aria-busy={pending || undefined}>
      {pending ? (
        <p role="status">{pendingMessage}</p>
      ) : error ? (
        <div role="alert" className="ds-workflow-error">
          {error}
          {onRetry && (
            <button
              type="button"
              className="ds-workflow-retry"
              onClick={onRetry}
            >
              {retryLabel}
            </button>
          )}
        </div>
      ) : success ? (
        <p role="status">{success}</p>
      ) : null}
    </div>
  );
}
