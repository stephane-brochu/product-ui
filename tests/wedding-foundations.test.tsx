import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Tabs } from "../src/components/ui/tabs";
import { MultiSelect } from "../src/components/ui/multi-select";
import { ReorderableList } from "../src/components/ui/reorderable-list";
import { ControlField, InputControl } from "../src/components/ui/field-control";
import { ThemeBoundary } from "../src/components/ui/theme-boundary";
import { Drawer } from "../src/components/ui/dialog";
import { Button } from "../src/components/ui/button";
import { WorkspaceShell } from "../src/components/patterns/workspace-shell";
import { Table } from "../src/components/ui/table";
import { CategoricalShareChart } from "../src/components/patterns/categorical-share-chart";
import { DevicePreviewFrame, HtmlPreview } from "../src/components/patterns/preview";

it("moves tabs with Arrow/Home/End, skips disabled tabs and labels the active panel", async () => {
  function Example() { const [value,setValue]=useState("one"); return <Tabs label="Views" value={value} onValueChange={setValue} options={[{value:"one",label:"One"},{value:"blocked",label:"Blocked",disabled:true},{value:"two",label:"Two"}]}>{value}</Tabs>; }
  render(<Example />); const user=userEvent.setup(); screen.getByRole("tab",{name:"One"}).focus();
  await user.keyboard("{ArrowRight}"); expect(screen.getByRole("tab",{name:"Two"})).toHaveFocus(); expect(screen.getByRole("tabpanel",{name:"Two"})).toHaveTextContent("two");
  await user.keyboard("{Home}"); expect(screen.getByRole("tab",{name:"One"})).toHaveAttribute("aria-selected","true");
  await user.keyboard("{End}"); expect(screen.getByRole("tab",{name:"Two"})).toHaveAttribute("tabindex","0");
});
it("keeps manual tab activation separate from arrow focus", async () => {
  const change=vi.fn(); render(<Tabs label="Views" value="one" activation="manual" onValueChange={change} options={[{value:"one",label:"One"},{value:"two",label:"Two"}]}>First</Tabs>);
  screen.getByRole("tab",{name:"One"}).focus(); await userEvent.setup().keyboard("{ArrowRight}"); expect(change).not.toHaveBeenCalled(); expect(screen.getByRole("tab",{name:"Two"})).toHaveFocus();
  await userEvent.setup().keyboard("{Enter}"); expect(change).toHaveBeenCalledWith("two");
});
it("reconciles stale multiselect IDs, selects enabled options and restores focus after Escape", async () => {
  function Example(){const [values,setValues]=useState(["stale","001"]);return <ThemeBoundary theme="wedding-admin"><form aria-label="Filters"><MultiSelect label="Regions" name="region" values={values} onValueChange={setValues} options={[{value:"001",label:"North"},{value:"002",label:"South"},{value:"003",label:"Locked",disabled:true}]} /></form></ThemeBoundary>;}
  render(<Example/>);const user=userEvent.setup(),trigger=screen.getByRole("button",{name:"Regions North"}); await user.click(trigger);
  expect(screen.getByRole("checkbox",{name:"All options"})).toHaveProperty("indeterminate",true);
  await user.click(screen.getByRole("checkbox",{name:"All options"}));expect(new FormData(screen.getByRole("form") as HTMLFormElement).getAll("region")).toEqual(["001","002"]);
  expect(screen.getByRole("checkbox",{name:"Locked"})).toBeDisabled(); await user.keyboard("{Escape}"); await waitFor(()=>expect(trigger).toHaveFocus());
});
it("reorders exact repeated values, announces position, retains focus and guards boundary moves", async()=>{
  function Example(){const [items,setItems]=useState([{value:"0002",label:"Alex"},{value:"0001",label:"Jamie"}]);return <form aria-label="Order"><ReorderableList label="Members" name="member" items={items} onChange={setItems}/></form>;}
  render(<Example/>);const user=userEvent.setup(),up=screen.getByRole("button",{name:"Move Jamie up"}); await user.click(up);
  expect(up).toHaveFocus();expect(up).toHaveAttribute("aria-disabled","true");expect(screen.getByRole("status")).toHaveTextContent("Jamie moved to position 1 of 2");
  expect(new FormData(screen.getByRole("form") as HTMLFormElement).getAll("member")).toEqual(["0001","0002"]);await user.click(up);expect(new FormData(screen.getByRole("form") as HTMLFormElement).getAll("member")).toEqual(["0001","0002"]);
});
it("associates composed fields with labels, descriptions and errors and preserves native payloads",()=>{
  render(<form aria-label="Edit"><ControlField label="Alias" description="Exact ID" error="Try again"><InputControl name="alias" defaultValue="00042" aria-describedby="extra" /></ControlField></form>);
  const input=screen.getByLabelText("Alias");expect(input).toHaveAccessibleDescription("Exact ID Try again"); expect(input).toHaveAttribute("aria-invalid","true");expect(input.getAttribute("aria-describedby")).toContain("extra");expect(new FormData(screen.getByRole("form") as HTMLFormElement).get("alias")).toBe("00042");
});
it("keeps drawer footer associated with its form, pending dismissal blocked and portals themed",async()=>{
  const submitted=vi.fn(),closed=vi.fn();render(<ThemeBoundary theme="wedding-admin"><Drawer open onOpenChange={closed} title="Edit" description="Details" dismissible={false} footer={<Button type="submit" form="edit">Save</Button>}><form id="edit" onSubmit={event=>{event.preventDefault();submitted();}}><input aria-label="Name"/></form></Drawer></ThemeBoundary>);
  const dialog=await screen.findByRole("dialog");expect(dialog.closest('[data-ui-theme]')).toHaveAttribute('data-ui-theme','wedding-admin');await userEvent.setup().click(within(dialog).getByRole("button",{name:"Save"}));expect(submitted).toHaveBeenCalledOnce();fireEvent.keyDown(dialog,{key:"Escape"});expect(closed).not.toHaveBeenCalled();expect(within(dialog).getByRole("button",{name:"Close dialog"})).toBeDisabled();
});
it("uses supplied navigation routes, grouping and external link policy without owning persistence",async()=>{
 const collapsed=vi.fn(),groups=vi.fn();render(<ThemeBoundary><WorkspaceShell label="Other workspace" brand="Atlas" collapsed={false} onCollapsedChange={collapsed} openGroupIds={[]} onOpenGroupIdsChange={groups} mobileOpen={false} onMobileOpenChange={()=>{}} entries={[{type:"group",id:"tools",label:"Tools",links:[{id:"external",href:"https://example.com",label:"External",external:true}]}]}><p>Content</p></WorkspaceShell></ThemeBoundary>);
 const user=userEvent.setup();await user.click(screen.getByRole("button",{name:"Tools"}));expect(groups).toHaveBeenCalledWith(["tools"]);await user.click(screen.getByRole("button",{name:"Collapse navigation"}));expect(collapsed).toHaveBeenCalledWith(true);
 expect(screen.getByRole("link",{name:"External",hidden:true})).toHaveAttribute("rel","noreferrer noopener");expect(screen.getAllByRole("main")).toHaveLength(1);
});
it("exposes stacked table semantics without changing native table markup",()=>{
 render(<Table mobileLayout="stack" aria-label="Costs"><tbody><tr><td data-label="Cost">Venue</td></tr></tbody></Table>);
 expect(screen.getByRole("table",{name:"Costs"})).toHaveAttribute("data-mobile-layout","stack");
 expect(screen.getByRole("cell")).toHaveAttribute("data-label","Cost");
});
it("renders exact categorical labels and rejects invalid share data",()=>{
 render(<CategoricalShareChart label="Costs total $12,500" totalLabel="$12,500" items={[{id:"one",label:"Venue",value:7500,valueLabel:"$7,500"},{id:"two",label:"Music",value:5000,valueLabel:"$5,000"}]} />);
 expect(screen.getByRole("img",{name:"Costs total $12,500"})).toBeInTheDocument();
 expect(screen.getByText("$7,500")).toBeInTheDocument();
 expect(()=>render(<CategoricalShareChart label="Bad" totalLabel="Bad" items={[{id:"bad",label:"Bad",value:-1,valueLabel:"-1"}]} />)).toThrow(/non-negative/);
});
it("fixes HTML preview isolation and applies exact device dimensions",()=>{
 const {container}=render(<><HtmlPreview title="Email" html="<p>Hi</p>" height={240}/><DevicePreviewFrame title="Phone" src="about:blank" width={390} height={844} scale={0.5}/></>);
 expect(screen.getByTitle("Email")).toHaveAttribute("sandbox","allow-popups allow-popups-to-escape-sandbox");
 expect(screen.getByTitle("Email")).toHaveAttribute("referrerpolicy","no-referrer");
 expect(container.querySelector(".ds-device-preview")).toHaveStyle({"--device-width":"390px","--device-height":"844px","--device-scale":"0.5"});
});
