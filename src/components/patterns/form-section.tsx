import type { ReactNode } from "react";

export function FormSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset
      className="ds-form-section"
      data-slot="form-section"
      aria-describedby={description ? `${id}-description` : undefined}
    >
      <legend>{title}</legend>
      {description && (
        <p id={`${id}-description`} className="ds-form-section-description">
          {description}
        </p>
      )}
      <div className="ds-form-section-fields">{children}</div>
    </fieldset>
  );
}
export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="ds-form-actions" data-slot="form-actions">
      {children}
    </div>
  );
}
