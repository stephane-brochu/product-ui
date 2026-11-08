import { useState, createRef } from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import userEvent from "@testing-library/user-event";
import {
  RadioGroup,
  SegmentedControl,
  Switch,
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
import { ThemeBoundary } from "../src/components/ui/theme-boundary";
import { Button } from "../src/components/ui/button";
const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Unavailable", disabled: true },
];
it("serializes native radio selection, supports controlled selection and ignores disabled choices", async () => {
  const user = userEvent.setup();
  function Example() {
    const [value, setValue] = useState("a");
    return (
      <form data-testid="choices">
        <RadioGroup
          label="Mode"
          name="mode"
          options={options}
          value={value}
          onValueChange={setValue}
        />
        <SegmentedControl
          label="Period"
          name="period"
          options={options}
          defaultValue="a"
          required
        />
      </form>
    );
  }
  render(<Example />);
  await user.click(
    within(screen.getByRole("group", { name: "Mode" })).getByLabelText("Beta"),
  );
  await user.click(
    within(screen.getByRole("group", { name: "Period" })).getByLabelText(
      "Beta",
    ),
  );
  const data = new FormData(screen.getByTestId("choices") as HTMLFormElement);
  expect(data.get("mode")).toBe("b");
  expect(data.get("period")).toBe("b");
  await user.click(
    within(screen.getByRole("group", { name: "Mode" })).getByLabelText(
      "Unavailable",
    ),
  );
  expect(
    new FormData(screen.getByTestId("choices") as HTMLFormElement).get("mode"),
  ).toBe("b");
});
it("provides native radio keyboard navigation and skips disabled options", async () => {
  const user = userEvent.setup();
  render(
    <SegmentedControl label="Period" options={options} defaultValue="a" />,
  );
  screen.getByRole("radio", { name: "Alpha" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("radio", { name: "Beta" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "Beta" })).toHaveFocus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("radio", { name: "Alpha" })).toBeChecked();
});
it("keeps required, validation descriptions, disabled fieldsets, empty and removed-option semantics", async () => {
  const view = render(
    <RadioGroup
      id="mode"
      label="Mode"
      options={options}
      defaultValue="a"
      description="Choose one"
      error="Fix selection"
      aria-describedby="extra"
      required
    />,
  );
  expect(screen.getByRole("group")).toHaveAttribute(
    "aria-describedby",
    "mode-description mode-error extra",
  );
  expect(screen.getByRole("radio", { name: "Alpha" })).toBeRequired();
  view.rerender(
    <RadioGroup
      label="Mode"
      options={[options[1]]}
      defaultValue="a"
      disabled
    />,
  );
  expect(screen.getByRole("radio")).not.toBeChecked();
  expect(screen.getByRole("radio")).toBeDisabled();
  view.rerender(<RadioGroup label="Mode" options={[]} />);
  expect(screen.getByText("No options available.")).toBeInTheDocument();
  expect(screen.queryByRole("radio")).not.toBeInTheDocument();
});
it("forwards switch ID, help, ref and checkbox FormData without a mixed state", async () => {
  const ref = createRef<HTMLInputElement>(),
    user = userEvent.setup();
  render(
    <form data-testid="switch-form">
      <Switch
        id="notify"
        ref={ref}
        name="notify"
        value="yes"
        label="Notifications"
        description="Email updates"
        error="Review choice"
        defaultChecked
      />
    </form>,
  );
  const input = screen.getByRole("switch", { name: "Notifications" });
  expect(ref.current).toBe(input);
  expect(input).toHaveAttribute("id", "notify");
  expect(input).toHaveAccessibleDescription("Email updates Review choice");
  expect(
    new FormData(screen.getByTestId("switch-form") as HTMLFormElement).get(
      "notify",
    ),
  ).toBe("yes");
  input.focus();
  await user.keyboard(" ");
  expect(input).not.toBeChecked();
  expect(
    new FormData(screen.getByTestId("switch-form") as HTMLFormElement).has(
      "notify",
    ),
  ).toBe(false);
});
it("disables switches through native semantics", async () => {
  render(<Switch label="Unavailable setting" disabled defaultChecked />);
  await userEvent.click(screen.getByRole("switch"));
  expect(screen.getByRole("switch")).toBeDisabled();
  expect(screen.getByRole("switch")).toBeChecked();
});
it("renders a disclosure open on the server and preserves native expansion", async () => {
  expect(
    renderToString(
      <Disclosure title="Sources" defaultOpen>
        Evidence
      </Disclosure>,
    ),
  ).toContain('open=""');
  render(
    <Disclosure title="Sources" count={0}>
      Evidence
    </Disclosure>,
  );
  await userEvent.click(screen.getByText("Sources"));
  expect(screen.getByText("Sources").closest("details")).toHaveAttribute(
    "open",
  );
  await userEvent.click(screen.getByText("Sources"));
  expect(screen.getByText("Sources").closest("details")).not.toHaveAttribute(
    "open",
  );
});
it("allows controlled validation reveal and returns focus when externally collapsed", async () => {
  const user = userEvent.setup();
  function Example() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Reveal error</Button>
        <ControlledDisclosure
          title="Details"
          open={open}
          onOpenChange={setOpen}
        >
          <input aria-label="Nested field" />
        </ControlledDisclosure>
        <Button onClick={() => setOpen(false)}>Collapse</Button>
      </>
    );
  }
  render(<Example />);
  await user.click(screen.getByRole("button", { name: "Reveal error" }));
  const details = screen.getByText("Details").closest("details")!;
  expect(details).toHaveAttribute("open");
  await user.click(screen.getByText("Details"));
  expect(details).not.toHaveAttribute("open");
  await user.click(screen.getByText("Details"));
  expect(details).toHaveAttribute("open");
  const field = screen.getByRole("textbox");
  field.focus();
  await user.click(screen.getByRole("button", { name: "Collapse" }));
  expect(details).not.toHaveAttribute("open");
});
it("restores summary focus when a controlled owner closes focused content", () => {
  const view = render(
    <ControlledDisclosure title="Details" open onOpenChange={() => {}}>
      <input aria-label="Nested field" />
    </ControlledDisclosure>,
  );
  screen.getByRole("textbox").focus();
  view.rerender(
    <ControlledDisclosure title="Details" open={false} onOpenChange={() => {}}>
      <input aria-label="Nested field" />
    </ControlledDisclosure>,
  );
  expect(screen.getByText("Details").closest("summary")).toHaveFocus();
});
it("keeps settings labelled and renders metadata zero distinctly from missing values", () => {
  render(
    <>
      <SettingsGroup title="Preferences" id="preferences" headingLevel={2}>
        <SettingsRow label="Updates">
          <Switch label="Receive updates" />
        </SettingsRow>
      </SettingsGroup>
      <MetadataList
        aria-label="Project details"
        items={[
          { id: "zero", term: "Count", value: 0 },
          { id: "missing", term: "Owner", value: null },
          { id: "long", term: "Identifier", value: "a".repeat(200) },
        ]}
      />
    </>,
  );
  expect(
    screen.getByRole("region", { name: "Preferences" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
    "Preferences",
  );
  expect(screen.getAllByRole("definition")[0]).toHaveTextContent("0");
  expect(screen.getAllByRole("definition")[1]).toHaveTextContent(
    "Not provided",
  );
});
it("opens a themed popover with slotted close, editing and Escape focus restoration", async () => {
  const user = userEvent.setup();
  render(
    <ThemeBoundary theme="studio">
      <Popover title="Project filters" trigger={<Button>Filters</Button>}>
        <input aria-label="Query" />
        <PopoverClose>Apply</PopoverClose>
      </Popover>
    </ThemeBoundary>,
  );
  const trigger = screen.getByRole("button", { name: "Filters" });
  await user.click(trigger);
  const popover = screen.getByRole("dialog", { name: "Project filters" });
  expect(popover.closest("[data-ui-theme]")).toHaveAttribute(
    "data-ui-theme",
    "studio",
  );
  expect(
    screen.queryByRole("button", { name: "Done" }),
  ).not.toBeInTheDocument();
  await user.type(within(popover).getByRole("textbox"), "hello");
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(trigger).toHaveFocus());
  await user.click(trigger);
  await user.click(screen.getByRole("button", { name: "Apply" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
it("supports keyboard menu selection, disabled items and themed portals", async () => {
  const user = userEvent.setup(),
    select = vi.fn();
  render(
    <ThemeBoundary theme="studio">
      <DropdownActionMenu
        label="Project actions"
        actions={[
          {
            id: "disabled",
            label: "Unavailable",
            disabled: true,
            onSelect: select,
          },
          { id: "rename", label: "Rename", onSelect: select },
          {
            id: "delete",
            label: "Remove",
            destructive: true,
            onSelect: () => {},
          },
        ]}
      />
    </ThemeBoundary>,
  );
  const trigger = screen.getByRole("button", { name: "Project actions" });
  trigger.focus();
  await user.keyboard("{ArrowDown}");
  await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());
  expect(screen.getByRole("menu").closest("[data-ui-theme]")).toHaveAttribute(
    "data-ui-theme",
    "studio",
  );
  expect(screen.getByRole("menuitem", { name: "Unavailable" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await user.keyboard("{Enter}");
  expect(select).toHaveBeenCalledOnce();
  await waitFor(() =>
    expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(trigger).toHaveFocus());
});
it("renders an empty action menu and never dispatches a disabled trigger", async () => {
  const user = userEvent.setup(),
    view = render(<DropdownActionMenu label="Actions" actions={[]} />);
  await user.click(screen.getByRole("button", { name: "Actions" }));
  expect(
    screen.getByRole("menuitem", { name: "No actions available" }),
  ).toHaveAttribute("aria-disabled", "true");
  await user.keyboard("{Escape}");
  view.rerender(<DropdownActionMenu label="Actions" actions={[]} disabled />);
  await user.click(screen.getByRole("button", { name: "Actions" }));
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});
it("links per-option descriptions without changing the choice name", () => {
  render(
    <RadioGroup
      label="Choice"
      description="Group help"
      error="Choose again"
      options={[{ value: "one", label: "First", description: "Option help" }]}
    />,
  );
  expect(
    screen.getByRole("radio", { name: "First" }),
  ).toHaveAccessibleDescription("Group help Choose again Option help");
});
it("keeps a nested popover inside the dialog theme and restores its own trigger focus", async () => {
  const { Dialog } = await import("../src/components/ui/dialog");
  const user = userEvent.setup();
  render(
    <ThemeBoundary theme="studio">
      <Dialog
        title="Editor"
        description="Nested controls"
        trigger={<Button>Edit workspace</Button>}
      >
        <Popover
          title="Nested filters"
          trigger={<Button>Nested filter trigger</Button>}
        >
          <PopoverClose>Finish filtering</PopoverClose>
        </Popover>
      </Dialog>
    </ThemeBoundary>,
  );
  await user.click(screen.getByRole("button", { name: "Edit workspace" }));
  const trigger = screen.getByRole("button", { name: "Nested filter trigger" });
  await user.click(trigger);
  expect(
    screen
      .getByRole("dialog", { name: "Nested filters" })
      .closest("[data-ui-theme]"),
  ).toHaveAttribute("data-ui-theme", "studio");
  await user.keyboard("{Escape}");
  expect(
    screen.queryByRole("dialog", { name: "Nested filters" }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("dialog", { name: "Editor" })).toBeInTheDocument();
  await waitFor(() => expect(trigger).toHaveFocus());
});
it("allows an action to prevent default menu dismissal", async () => {
  const user = userEvent.setup();
  render(
    <DropdownActionMenu
      label="Stay open"
      actions={[
        { id: "keep", label: "Keep open", onSelect: (e) => e.preventDefault() },
      ]}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Stay open" }));
  await user.click(screen.getByRole("menuitem", { name: "Keep open" }));
  expect(screen.getByRole("menu")).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});
it("resets uncontrolled native choices and switches with their owning form", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <RadioGroup label="Mode" options={options} defaultValue="a" />
      <SegmentedControl label="Period" options={options} defaultValue="a" />
      <Switch label="Updates" defaultChecked />
      <button type="reset">Reset form</button>
    </form>,
  );
  await user.click(
    within(screen.getByRole("group", { name: "Mode" })).getByRole("radio", {
      name: "Beta",
    }),
  );
  await user.click(
    within(screen.getByRole("group", { name: "Period" })).getByRole("radio", {
      name: "Beta",
    }),
  );
  await user.click(screen.getByRole("switch"));
  await user.click(screen.getByRole("button", { name: "Reset form" }));
  expect(
    within(screen.getByRole("group", { name: "Mode" })).getByRole("radio", {
      name: "Alpha",
    }),
  ).toBeChecked();
  expect(
    within(screen.getByRole("group", { name: "Period" })).getByRole("radio", {
      name: "Alpha",
    }),
  ).toBeChecked();
  expect(screen.getByRole("switch")).toBeChecked();
});
