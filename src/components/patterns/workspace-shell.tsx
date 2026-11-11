"use client";
import { useId, type ReactNode } from "react";
import { Button, IconButton } from "../ui/button";
import { Drawer } from "../ui/dialog";
import type { NavigationLinkProps, NavigationProps } from "./navigation";
export type WorkspaceLink = { id: string; label: string; href: string; icon?: ReactNode; external?: boolean };
export type WorkspaceEntry = { type: "link"; link: WorkspaceLink } | { type: "group"; id: string; label: string; icon?: ReactNode; links: readonly WorkspaceLink[] };
/** Controlled navigation chrome. Routing, auth and preference storage belong to the product. */
export function WorkspaceShell({ label, brand, collapsedBrand, accountControl, header, children, entries, activeHref,
  collapsed, onCollapsedChange, openGroupIds, onOpenGroupIdsChange, mobileOpen, onMobileOpenChange, linkComponent: Link = "a", mainId = "workspace-main" }: {
  label: string; brand: ReactNode; collapsedBrand?: ReactNode; accountControl?: ReactNode; header?: ReactNode; children: ReactNode;
  entries: readonly WorkspaceEntry[]; activeHref?: string; collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void;
  openGroupIds: readonly string[]; onOpenGroupIdsChange: (ids: string[]) => void; mobileOpen: boolean; onMobileOpenChange: (open: boolean) => void;
  linkComponent?: NavigationProps["linkComponent"]; mainId?: string;
}) {
  const id = useId();
  function navigation(compact: boolean, suffix: string) {
    function link(item: WorkspaceLink) {
      const attributes: NavigationLinkProps = { href: item.href, "aria-current": activeHref === item.href ? "page" : undefined,
        "aria-label": compact ? item.label : undefined, title: compact ? item.label : undefined,
        target: item.external ? "_blank" : undefined, rel: item.external ? "noreferrer noopener" : undefined,
        onClick: () => onMobileOpenChange(false) };
      return <Link {...attributes} key={item.id}><span aria-hidden="true">{item.icon}</span><span className="ds-workspace-nav-label">{item.label}</span></Link>;
    }
    return <nav aria-label={label} className="ds-workspace-nav" id={`${id}-${suffix}`}>
      {entries.map(entry => entry.type === "link" ? link(entry.link) : <div key={entry.id}>
        <Button variant="tertiary" aria-expanded={openGroupIds.includes(entry.id)} aria-controls={`${id}-${suffix}-${entry.id}`}
          aria-label={compact ? entry.label : undefined} title={compact ? entry.label : undefined}
          onClick={() => onOpenGroupIdsChange(openGroupIds.includes(entry.id) ? openGroupIds.filter(item => item !== entry.id) : [...openGroupIds, entry.id])}>
          <span aria-hidden="true">{entry.icon}</span><span className="ds-workspace-nav-label">{entry.label}</span><span aria-hidden="true">▾</span>
        </Button><div className="ds-workspace-subnav" id={`${id}-${suffix}-${entry.id}`} hidden={!openGroupIds.includes(entry.id)}>{entry.links.map(link)}</div>
      </div>)}
    </nav>;
  }
  return <div className="ds-workspace-shell" data-collapsed={collapsed || undefined}>
    <a className="ds-shell-skip" href={`#${mainId}`}>Skip to content</a>
    <aside className="ds-workspace-sidebar">
      <div className="ds-workspace-brand"><div>{collapsed ? collapsedBrand ?? brand : brand}</div>
        <IconButton variant="tertiary" label={collapsed ? "Expand navigation" : "Collapse navigation"} aria-expanded={!collapsed} aria-controls={`${id}-desktop`} onClick={() => onCollapsedChange(!collapsed)}>☰</IconButton>
      </div>{navigation(collapsed, "desktop")}<div className="ds-workspace-account">{accountControl}</div>
    </aside>
    <div className="ds-workspace-mobile-bar"><div>{brand}</div><IconButton variant="tertiary" label="Open navigation" aria-expanded={mobileOpen} onClick={() => onMobileOpenChange(true)}>☰</IconButton></div>
    <main id={mainId} className="ds-workspace-main" tabIndex={-1}>{header}{children}</main>
    <Drawer title={label} description="Choose a section." open={mobileOpen} onOpenChange={onMobileOpenChange} className="ds-workspace-mobile-drawer" closeLabel="Close navigation">
      {navigation(false, "mobile")}<div className="ds-workspace-account">{accountControl}</div>
    </Drawer>
  </div>;
}
