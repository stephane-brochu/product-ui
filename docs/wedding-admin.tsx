import { useState, type FormEvent } from "react";
import { ThemeBoundary } from "../src/components/ui/theme-boundary";
import { WorkspaceShell, type WorkspaceEntry } from "../src/components/patterns/workspace-shell";
import { SurfaceCard, Stack, Inline, StatusIndicator, ActionRow } from "../src/components/patterns/surface";
import { PageHeader } from "../src/components/patterns/page-layout";
import { ControlField, InputControl, TextareaControl } from "../src/components/ui/field-control";
import { Tabs } from "../src/components/ui/tabs";
import { MultiSelect } from "../src/components/ui/multi-select";
import { ReorderableList } from "../src/components/ui/reorderable-list";
import { Button } from "../src/components/ui/button";
import { Drawer } from "../src/components/ui/dialog";
import { Checkbox } from "../src/components/ui/checkbox";
import { CategoricalShareChart } from "../src/components/patterns/categorical-share-chart";
import { DevicePreviewFrame, HtmlPreview } from "../src/components/patterns/preview";
const entries: WorkspaceEntry[] = [
  { type: "link", link: { id: "guests", label: "Guests", href: "#wedding-admin", icon: "◎" } },
  { type: "group", id: "planning", label: "Planning", icon: "✓", links: [{ id: "tasks", label: "Tasks", href: "#wedding-admin", icon: "✓" }] },
];
/** Fictional product example: no application routes, records or mutation clients. */
export function WeddingAdminExample() {
  const [collapsed, setCollapsed] = useState(false), [mobileOpen, setMobileOpen] = useState(false), [groups, setGroups] = useState<string[]>(["planning"]);
  const [tab, setTab] = useState("guests"), [countries, setCountries] = useState(["ca", "gb"]), [open, setOpen] = useState(false);
  const [order, setOrder] = useState([{ value: "person-1", label: "Alex Morgan" }, { value: "person-2", label: "Jamie Morgan" }]);
  const [pending, setPending] = useState(false), [failure, setFailure] = useState(false), [error, setError] = useState("");
  const [completed, setCompleted] = useState(false), [saved, setSaved] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setPending(true); setError("");
    await new Promise(resolve => setTimeout(resolve, 350));
    setPending(false);
    if (failure) { setError("Example save failed. Your draft is retained; switch off failure and retry."); return; }
    setSaved(`Saved ${String(form.get("display"))}; order: ${form.getAll("memberOrder").join(", ")}.`); setOpen(false);
  }
  return <section id="wedding-admin" className="doc-section"><p className="eyebrow">Cross-product adoption / v0.8</p><h2>Wedding admin foundations</h2>
    <p>The Wedding admin theme uses the same shared components. Try the grouped navigation, filters, tabs and ordered fields. Save failures are simulated; no records are sent anywhere.</p>
    <ThemeBoundary theme="wedding-admin"><div className="demo-workspace">
      <WorkspaceShell label="Example planning navigation" brand="Meadow celebration" collapsedBrand="M" entries={entries} activeHref="#wedding-admin"
        collapsed={collapsed} onCollapsedChange={setCollapsed} openGroupIds={groups} onOpenGroupIdsChange={setGroups} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen}
        header={<PageHeader title="Guests" description="Fictional planning workspace" />} mainId="example-planning-main">
        <Stack>
          <Tabs label="Planning views" value={tab} onValueChange={setTab} options={[{ label: "Guests", value: "guests" }, { label: "Tasks", value: "tasks" }]}>
            {tab === "guests" ? <Stack><Inline><MultiSelect label="Country" allLabel="All countries" emptyLabel="No countries" itemLabel="country" itemLabelPlural="countries" values={countries} onValueChange={setCountries} options={[{ value: "ca", label: "Canada" }, { value: "gb", label: "United Kingdom" }]} /></Inline>
              <SurfaceCard><ActionRow onClick={() => { setOpen(true); setError(""); }} trailing={<StatusIndicator label="Attending" tone="success" />}>Alex and Jamie Morgan</ActionRow></SurfaceCard>
            </Stack> : <SurfaceCard><Checkbox label="Confirm the venue walkthrough" checked={completed} onChange={event => setCompleted(event.target.checked)} /><p>{completed ? "1 of 1 tasks complete" : "0 of 1 tasks complete"}</p></SurfaceCard>}
          </Tabs>
          <p role="status">{saved}</p>
          <SurfaceCard>
            <h3>Portable data and preview surfaces</h3>
            <CategoricalShareChart label="Fictional planned costs by category, total $12,500" totalLabel="$12,500" items={[{ id: "venue", label: "Venue", value: 7500, valueLabel: "$7,500" }, { id: "music", label: "Music", value: 5000, valueLabel: "$5,000" }]} />
            <HtmlPreview title="Fictional confirmation email" height={180} html="<main style='font:16px system-ui;padding:24px'><h1>Thanks, Alex</h1><p>Your fictional response is confirmed.</p></main>" />
            <DevicePreviewFrame title="Blank device-frame example" src="about:blank" width={390} height={240} scale={0.72} />
          </SurfaceCard>
        </Stack>
      </WorkspaceShell>
      <Drawer title="Edit household" description="Update the fictional invitation and member order." eyebrow="Example guest workflow" open={open} onOpenChange={setOpen} dismissible={!pending}
        footer={<Button type="submit" form="example-household" loading={pending}>Save &amp; close</Button>}>
        <form id="example-household" onSubmit={save}><Stack>
          <ControlField label="Invitation display"><InputControl name="display" defaultValue="Alex and Jamie" required disabled={pending} /></ControlField>
          <ControlField label="Notes"><TextareaControl name="notes" rows={3} disabled={pending} /></ControlField>
          <ReorderableList label="Invitation member order" items={order} onChange={setOrder} name="memberOrder" disabled={pending} />
          <Checkbox label="Simulate save failure" checked={failure} onChange={event => setFailure(event.target.checked)} disabled={pending} />
          {error && <p role="alert">{error}</p>}
        </Stack></form>
      </Drawer>
    </div></ThemeBoundary>
  </section>;
}
