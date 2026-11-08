import type { ReactNode } from "react";
export type UploadQueueItem = {
  id: string;
  name: string;
  status: ReactNode;
  message?: ReactNode;
  progress?: number;
  actions?: ReactNode;
};
/** Supplied snapshots/actions only. This component never uploads or retries a network request. */
export function UploadQueue({
  items,
  label = "Upload queue",
  emptyMessage = "No files queued.",
  busy = false,
}: {
  items: readonly UploadQueueItem[];
  label?: string;
  emptyMessage?: ReactNode;
  busy?: boolean;
}) {
  return (
    <section
      className="ds-upload-queue"
      aria-label={label}
      aria-busy={busy || undefined}
    >
      {!items.length ? (
        <p>{emptyMessage}</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <div role="status">
                  {item.status}
                  {item.message != null && <p>{item.message}</p>}
                </div>
                {item.progress !== undefined && (
                  <progress
                    max={100}
                    value={Math.max(
                      0,
                      Math.min(
                        100,
                        Number.isFinite(item.progress) ? item.progress : 0,
                      ),
                    )}
                    aria-label={`${item.name} progress`}
                  />
                )}
              </div>
              {item.actions}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
