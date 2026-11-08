import type { ComponentPropsWithoutRef, ReactNode } from "react";
export function PageContainer({
  wide = false,
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div"> & { wide?: boolean }) {
  return (
    <div
      {...props}
      className={`ds-page ${wide ? "ds-page--wide" : ""} ${className}`}
    />
  );
}
type HeadingLevel = 1 | 2 | 3 | 4;
export type PageHeaderProps = Omit<
  ComponentPropsWithoutRef<"header">,
  "title"
> & {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  headingLevel?: HeadingLevel;
};
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  headingLevel = 1,
  className = "",
  ...props
}: PageHeaderProps) {
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3" | "h4";
  return (
    <header {...props} className={`ds-page-header ${className}`}>
      <div>
        {eyebrow && <p className="ds-eyebrow">{eyebrow}</p>}
        <Heading>{title}</Heading>
        {description && <p className="ds-intro">{description}</p>}
      </div>
      {action && <div className="ds-page-action">{action}</div>}
    </header>
  );
}
export type SectionHeaderProps = Omit<
  ComponentPropsWithoutRef<"header">,
  "title" | "id"
> & {
  number?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  id?: string;
  headingLevel?: HeadingLevel;
};
/** id belongs to the heading so existing section anchors remain stable. */
export function SectionHeader({
  number,
  title,
  description,
  action,
  id,
  headingLevel = 2,
  className = "",
  ...props
}: SectionHeaderProps) {
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3" | "h4";
  return (
    <header {...props} className={`ds-section-header ${className}`}>
      <div className="ds-section-title">
        {number && <span className="ds-section-number">{number}</span>}
        <div>
          <Heading id={id}>{title}</Heading>
          {description && <p>{description}</p>}
        </div>
      </div>
      {action}
    </header>
  );
}
