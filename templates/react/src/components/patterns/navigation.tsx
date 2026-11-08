import type { ComponentPropsWithRef, ComponentType, ReactNode } from "react";

export type NavigationItem = {
  label: string;
  href: string;
  disabled?: boolean;
};
export type NavigationLinkProps = ComponentPropsWithRef<"a"> & { href: string };
export type NavigationProps = {
  items: readonly NavigationItem[];
  activeHref?: string;
  label?: string;
  linkComponent?: ComponentType<NavigationLinkProps> | "a";
};
export function NavigationLinks({
  items,
  activeHref,
  linkComponent: Link = "a",
  onNavigate,
}: NavigationProps & { onNavigate?: () => void }) {
  return items.map((item) =>
    item.disabled ? (
      <span key={item.href} className="ds-nav-disabled" aria-disabled="true">
        {item.label}
      </span>
    ) : (
      <Link
        key={item.href}
        href={item.href}
        aria-current={activeHref === item.href ? "page" : undefined}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    ),
  );
}
export function PrimaryNavigation({
  label = "Primary",
  ...props
}: NavigationProps) {
  return (
    <nav className="ds-primary-nav" aria-label={label}>
      <NavigationLinks {...props} />
    </nav>
  );
}
export function Sidebar({
  label,
  ...props
}: NavigationProps & { label: string }) {
  return (
    <aside className="ds-sidebar">
      <p className="ds-sidebar-label">{label}</p>
      <nav aria-label={label}>
        <NavigationLinks {...props} />
      </nav>
    </aside>
  );
}
export function SectionNavigation({
  label,
  items,
  activeHref,
  linkComponent: Link = "a",
  leading,
  className = "",
}: NavigationProps & {
  label: string;
  leading?: ReactNode;
  className?: string;
}) {
  return (
    <nav className={`ds-section-navigation ${className}`} aria-label={label}>
      {leading}
      {items.map((item) =>
        item.disabled ? (
          <span key={item.href} aria-disabled="true">
            {item.label}
          </span>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            aria-current={
              activeHref === item.href
                ? item.href.startsWith("#")
                  ? "location"
                  : "page"
                : undefined
            }
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
export function Breadcrumbs({
  items,
  label = "Breadcrumb",
  linkComponent: Link = "a",
}: {
  items: readonly { label: string; href?: string }[];
  label?: string;
  linkComponent?: NavigationProps["linkComponent"];
}) {
  return (
    <nav className="ds-breadcrumbs" aria-label={label}>
      <ol>
        {items.map((item, index) => (
          <li key={`${index}-${item.label}`}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link
                href={item.href}
                aria-current={index === items.length - 1 ? "page" : undefined}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={index === items.length - 1 ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function Header({
  brand,
  navigation,
  accountControl,
  mobileNavigation,
}: {
  brand: ReactNode;
  navigation?: ReactNode;
  accountControl?: ReactNode;
  mobileNavigation?: ReactNode;
}) {
  return (
    <header className="ds-app-header">
      <div className="ds-header-main">
        <div className="ds-wordmark">{brand}</div>
        {navigation}
        <div className="ds-header-account">{accountControl}</div>
        {mobileNavigation}
      </div>
    </header>
  );
}
export function AppShell({
  header,
  sidebar,
  children,
  mainId,
  skipLabel = "Skip to content",
  contentAs = "main",
  className = "",
}: {
  header?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  mainId?: string;
  skipLabel?: string;
  contentAs?: "main" | "div";
  className?: string;
}) {
  const Content = contentAs;
  return (
    <div className={`ds-app-shell ${className}`}>
      {mainId && contentAs === "main" && (
        <a className="ds-shell-skip" href={`#${mainId}`}>
          {skipLabel}
        </a>
      )}
      {header}
      <div
        className="ds-shell-body"
        data-sidebar={sidebar != null || undefined}
      >
        {sidebar}
        <Content
          id={mainId}
          className="ds-shell-content"
          tabIndex={mainId ? -1 : undefined}
        >
          {children}
        </Content>
      </div>
    </div>
  );
}
