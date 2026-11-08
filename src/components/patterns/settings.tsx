import type { ComponentPropsWithRef, ReactNode } from "react";
export type SettingsGroupProps = Omit<
  ComponentPropsWithRef<"section">,
  "title"
> & { title: ReactNode; description?: ReactNode; headingLevel?: 2 | 3 | 4 };
export function SettingsGroup({
  title,
  description,
  children,
  headingLevel = 3,
  id,
  className = "",
  ...props
}: SettingsGroupProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <section
      {...props}
      id={id}
      className={`ds-settings-group ${className}`}
      aria-labelledby={
        props["aria-labelledby"] ?? (id ? `${id}-title` : undefined)
      }
    >
      <Heading id={id ? `${id}-title` : undefined}>{title}</Heading>
      {description && <p className="ds-settings-description">{description}</p>}
      {children}
    </section>
  );
}
export type SettingsRowProps = ComponentPropsWithRef<"div"> & {
  label: ReactNode;
  description?: ReactNode;
};
/** The slotted control still needs its own accessible label. */
export function SettingsRow({
  label,
  description,
  children,
  className = "",
  ...props
}: SettingsRowProps) {
  return (
    <div {...props} className={`ds-settings-row ${className}`}>
      <div>
        <strong>{label}</strong>
        {description && (
          <p className="ds-settings-description">{description}</p>
        )}
      </div>
      <div className="ds-settings-control">{children}</div>
    </div>
  );
}
export type MetadataItem = {
  id: string;
  term: ReactNode;
  value: ReactNode;
  action?: ReactNode;
};
export type MetadataListProps = Omit<
  ComponentPropsWithRef<"dl">,
  "children"
> & {
  items: readonly MetadataItem[];
  emptyValue?: ReactNode;
};
export function MetadataList({
  items,
  emptyValue = "Not provided",
  className = "",
  ...props
}: MetadataListProps) {
  return (
    <dl {...props} className={`ds-metadata ${className}`}>
      {items.map((item) => (
        <div className="ds-metadata-row" key={item.id}>
          <dt>{item.term}</dt>
          <dd>
            <div>{item.value ?? emptyValue}</div>
            {item.action && (
              <div className="ds-metadata-action">{item.action}</div>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
