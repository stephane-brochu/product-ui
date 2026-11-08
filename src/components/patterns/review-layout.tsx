import type { ComponentPropsWithRef, ReactNode } from "react";
export function ReviewLayout({
  evidence,
  children,
  evidenceLabel = "Source evidence",
  reviewLabel = "Review",
  className = "",
  ...props
}: ComponentPropsWithRef<"div"> & {
  evidence: ReactNode;
  evidenceLabel?: string;
  reviewLabel?: string;
}) {
  return (
    <div {...props} className={`ds-review-layout ${className}`}>
      <section aria-label={evidenceLabel} className="ds-review-evidence">
        {evidence}
      </section>
      <section aria-label={reviewLabel} className="ds-review-content">
        {children}
      </section>
    </div>
  );
}
export type HistoryEvent = {
  id: string;
  title: ReactNode;
  dateLabel: ReactNode;
  dateTime?: string;
  detail?: ReactNode;
  source?: ReactNode;
};
export function HistoryTimeline({
  events,
  label = "History",
  emptyMessage = "No history yet.",
}: {
  events: readonly HistoryEvent[];
  label?: string;
  emptyMessage?: ReactNode;
}) {
  return (
    <section className="ds-history-timeline" aria-label={label}>
      {events.length ? (
        <ol>
          {events.map((event) => (
            <li key={event.id}>
              <time dateTime={event.dateTime}>{event.dateLabel}</time>
              <div>
                <strong>{event.title}</strong>
                {event.detail != null && <div>{event.detail}</div>}
                {event.source}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p>{emptyMessage}</p>
      )}
    </section>
  );
}
