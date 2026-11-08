import { useState } from "react";
import { Button } from "../src/components/ui/button";
import { Checkbox } from "../src/components/ui/checkbox";
import { TextInput } from "../src/components/ui/fields";
import {
  Switch,
  RadioGroup,
  SegmentedControl,
} from "../src/components/ui/selection";
import { Disclosure } from "../src/components/patterns/disclosure";
import { ControlledDisclosure } from "../src/components/patterns/controlled-disclosure";
import {
  SettingsGroup,
  SettingsRow,
  MetadataList,
} from "../src/components/patterns/settings";
import { Popover, PopoverClose } from "../src/components/ui/popover";
import { DropdownActionMenu } from "../src/components/ui/action-menu";
export function MilestoneOne() {
  const [disabled, setDisabled] = useState(false),
    [invalid, setInvalid] = useState(false),
    [empty, setEmpty] = useState(false),
    [mode, setMode] = useState("team"),
    [updates, setUpdates] = useState(true),
    [period, setPeriod] = useState("month"),
    [open, setOpen] = useState(false),
    [message, setMessage] = useState(""),
    [query, setQuery] = useState("");
  const options = empty
    ? []
    : [
        { value: "team", label: "Team workspace" },
        { value: "personal", label: "Personal workspace" },
        {
          value: "unavailable",
          label: "Unavailable workspace",
          disabled: true,
        },
      ];
  return (
    <>
      <section id="selection-native">
        <p className="eyebrow">Milestone 1 / Everyday controls</p>
        <h2>Native choices with complete form behavior.</h2>
        <p>
          RadioGroup and SegmentedControl each select one value. Both use native
          radio inputs: Tab enters the group; arrow keys move between enabled
          choices. Switch is a two-state native checkbox with switch semantics.
          Names and values serialize through FormData.
        </p>
        <div className="button-row">
          <Checkbox
            label="Disable selection examples"
            checked={disabled}
            onChange={(e) => setDisabled(e.target.checked)}
          />
          <Checkbox
            label="Show selection validation"
            checked={invalid}
            onChange={(e) => setInvalid(e.target.checked)}
          />
          <Checkbox
            label="Use empty options"
            checked={empty}
            onChange={(e) => setEmpty(e.target.checked)}
          />
        </div>
        <form
          className="demo"
          onSubmit={(e) => {
            e.preventDefault();
            setMessage(
              JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
            );
          }}
        >
          <RadioGroup
            id="workspace-mode"
            label="Workspace type"
            name="workspace"
            options={options}
            value={mode}
            onValueChange={setMode}
            disabled={disabled}
            required
            description="Choose the workspace to create."
            error={
              invalid ? "Choose a workspace before continuing." : undefined
            }
          />
          <SegmentedControl
            label="Summary period"
            name="period"
            value={period}
            onValueChange={setPeriod}
            disabled={disabled}
            options={
              empty
                ? []
                : [
                    { value: "week", label: "Week" },
                    { value: "month", label: "Month" },
                    { value: "year", label: "Year" },
                  ]
            }
          />
          <Switch
            id="workspace-updates"
            label="Receive workspace updates"
            name="updates"
            value="enabled"
            checked={updates}
            onChange={(e) => setUpdates(e.target.checked)}
            disabled={disabled}
            description="Updates are optional."
            error={invalid ? "Review your notification preference." : undefined}
          />
          <Button type="submit">Inspect submitted values</Button>
        </form>
        {message && <p role="status">Preview only: {message}</p>}
        <p>
          Use value/onValueChange for controlled choices, or defaultValue for an
          uncontrolled group. Disabled options never submit. Removing the
          selected option leaves no selection; choose a replacement in the
          product. Empty groups show an empty message. Required applies to radio
          groups; Switch has no mixed or read-only mode.
        </p>
        <pre>
          <code>{`<RadioGroup label="Mode" name="mode" options={options}
  defaultValue="team" required description="Choose one" error={error} />
<SegmentedControl label="Period" options={periods}
  value={period} onValueChange={setPeriod} />
<Switch label="Updates" name="updates" defaultChecked />`}</code>
        </pre>
      </section>
      <section id="disclosures-settings">
        <p className="eyebrow">Composition</p>
        <h2>Disclosures, settings and metadata.</h2>
        <div className="demo">
          <Disclosure title="Project evidence" count={2}>
            <p>
              Native details/summary works before hydration and preserves
              browser keyboard behavior.
            </p>
            <MetadataList
              aria-label="Project evidence"
              items={[
                { id: "count", term: "Open items", value: 0 },
                { id: "owner", term: "Owner", value: null },
                {
                  id: "reference",
                  term: "Reference",
                  value:
                    "workspace-reference-2026-very-long-identifier-for-responsive-wrapping",
                },
              ]}
            />
          </Disclosure>
          <div className="button-row">
            <Button variant="secondary" onClick={() => setOpen(true)}>
              Reveal details for validation
            </Button>
            <Button variant="tertiary" onClick={() => setOpen(false)}>
              Collapse details
            </Button>
          </div>
          <ControlledDisclosure
            title="Editable project details"
            open={open}
            onOpenChange={setOpen}
          >
            <TextInput
              label="Project reference"
              description="Closing from outside returns focus to the summary if this input had focus."
              defaultValue="Harbour"
            />
          </ControlledDisclosure>
          <SettingsGroup
            id="workspace-settings"
            title="Workspace preferences"
            description="Each control provides its own accessible label."
          >
            <SettingsRow
              label="Delivery"
              description="Choose when updates arrive."
            >
              <RadioGroup
                label="Delivery schedule"
                defaultValue="daily"
                options={[
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                ]}
              />
            </SettingsRow>
            <SettingsRow
              label="Notifications"
              description="You can change this preference at any time."
            >
              <Switch label="Enable notifications" defaultChecked />
            </SettingsRow>
          </SettingsGroup>
        </div>
        <p>
          Disclosure is server-compatible and uses defaultOpen for initial
          expansion. ControlledDisclosure adds open/onOpenChange for validation
          reveal; actions belong inside its content. SettingsGroup supports
          headingLevel and native section attributes. MetadataList accepts
          rendered values and stable item IDs; only null/undefined uses the
          missing-value fallback, so zero remains zero. Empty lists render no
          entries.
        </p>
      </section>
      <section id="floating-controls">
        <p className="eyebrow">Optional controls</p>
        <h2>Popover & action menus.</h2>
        <p>
          Try Escape, arrow keys and focus return. Portals inherit the selected
          theme through ThemeBoundary. Popover is non-modal by default and has
          no built-in Done action; compose its content and PopoverClose as
          needed. Menu items use stable IDs and support disabled/destructive
          presentation.
        </p>
        <div className="button-row">
          <Popover
            title="Workspace filters"
            trigger={
              <Button variant="secondary">Open workspace filters</Button>
            }
          >
            <TextInput
              label="Filter query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <p className="floating-example-note">
              The product owns filtering and requests.
            </p>
            <PopoverClose
              variant="secondary"
              onClick={() =>
                setMessage(
                  query ? `Filter applied: ${query}` : "All workspaces",
                )
              }
            >
              Apply filters
            </PopoverClose>
          </Popover>
          <DropdownActionMenu
            label="Workspace actions"
            actions={[
              {
                id: "export",
                label: "Export preview",
                onSelect: () =>
                  setMessage(
                    "Export selected. No real file or request was created.",
                  ),
              },
              {
                id: "rename",
                label: "Rename workspace",
                onSelect: () => setMessage("Rename selected."),
              },
              {
                id: "blocked",
                label: "Unavailable action",
                disabled: true,
                onSelect: () => {},
              },
              {
                id: "remove",
                label: "Remove preview",
                destructive: true,
                onSelect: () =>
                  setMessage(
                    "Remove selected. This is a presentation-only example.",
                  ),
              },
            ]}
          />
          <DropdownActionMenu label="Empty actions" actions={[]} />
          <DropdownActionMenu label="Disabled actions" actions={[]} disabled />
        </div>
        <p role="status">{message || "No action selected."}</p>
        <p>
          Callbacks are synchronous selection notifications. Products own
          asynchronous work, destructive confirmation, permissions and error
          recovery. Menu selection closes by default; preventDefault on the
          supplied event to keep it open. Native browser behavior and Radix
          handle keyboard interaction; this is not a searchable combobox.
        </p>
        <pre>
          <code>{`npm install --save-exact @radix-ui/react-popover@1.3.1 @radix-ui/react-dropdown-menu@2.2.1
npx shadcn@4.23.0 add https://brochu-product-ui.vercel.app/r/v0.5.0/popover.json https://brochu-product-ui.vercel.app/r/v0.5.0/action-menu.json

<Popover title="Filters" trigger={<Button>Filters</Button>}>
  ...
  <PopoverClose>Apply</PopoverClose>
</Popover>`}</code>
        </pre>
        <p>
          Expanded core imports ui-composition.css alongside the existing core
          CSS. Optional floating controls import ui-floating.css. Both support
          contentProps for alignment, collision padding, ref and focus events.
          The shared theme defines their layer token.
        </p>
        <p>
          <a href="https://github.com/stephane-brochu/product-ui/blob/v0.4.0/docs/migrations/v0.4.0.md">
            Read the migration and component contracts
          </a>
          .
        </p>
      </section>
    </>
  );
}
