import { createRef, useState } from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "../src/components/ui/checkbox";
import { Textarea, TextInput } from "../src/components/ui/fields";
import { Button } from "../src/components/ui/button";
import { Dialog, Drawer, DialogClose } from "../src/components/ui/dialog";
import { ThemeBoundary } from "../src/components/ui/theme-boundary";
import {
  ErrorState,
  InlineAlert,
  ProgressIndicator,
  StatusBadge,
} from "../src/components/ui/feedback";
import {
  PageHeader,
  SectionHeader,
} from "../src/components/patterns/page-layout";
it("preserves checkbox identity, descriptions, ref, mixed state and native form data", async () => {
  const user = userEvent.setup(),
    ref = createRef<HTMLInputElement>();
  render(
    <form data-testid="form">
      <p id="external">More context</p>
      <Checkbox
        id="consent"
        ref={ref}
        label="Consent"
        name="consent"
        value="yes"
        description="Required"
        error="Choose a value"
        aria-describedby="external"
        indeterminate
      />
    </form>,
  );
  const input = screen.getByRole("checkbox", { name: "Consent" });
  expect(input).toHaveAttribute("id", "consent");
  expect(ref.current).toBe(input);
  expect(input).toHaveAttribute("aria-checked", "mixed");
  expect(ref.current?.indeterminate).toBe(true);
  expect(input).toHaveAccessibleDescription(
    "Required Choose a value More context",
  );
  await user.click(input);
  expect(
    new FormData(screen.getByTestId("form") as HTMLFormElement).get("consent"),
  ).toBe("yes");
});
it("forwards multiline native semantics and validation relationships", () => {
  const ref = createRef<HTMLTextAreaElement>();
  render(
    <>
      <p id="hint">External</p>
      <Textarea
        id="notes"
        ref={ref}
        label="Notes"
        name="notes"
        required
        readOnly
        rows={7}
        defaultValue="Draft"
        description="Help"
        error="Invalid note"
        aria-describedby="hint"
      />
    </>,
  );
  const input = screen.getByRole("textbox", { name: "Notes" });
  expect(input).toHaveAttribute("id", "notes");
  expect(ref.current).toBe(input);
  expect(input).toHaveAttribute("readonly");
  expect(input).toHaveAttribute("required");
  expect(input).toHaveAttribute("rows", "7");
  expect(input).toHaveAccessibleDescription("Help Invalid note External");
});
it("supports document heading order and native layout attributes", () => {
  render(
    <>
      <PageHeader
        headingLevel={2}
        title="Projects"
        aria-label="Project header"
      />
      <SectionHeader id="details" headingLevel={3} title="Details" />
    </>,
  );
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
    "Projects",
  );
  expect(screen.getByRole("heading", { level: 3 })).toHaveAttribute(
    "id",
    "details",
  );
});
it("makes retry an explicit action and handles finite and unknown progress", async () => {
  const retry = vi.fn();
  render(
    <>
      <ErrorState onRetry={retry} />
      <InlineAlert title="Information">Details</InlineAlert>
      <StatusBadge tone="warning">Needs review</StatusBadge>
      <ProgressIndicator label="Known" value={150} />
      <ProgressIndicator label="Unknown" value={NaN} />
    </>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledOnce();
  expect(screen.getByRole("note")).toHaveTextContent("Information");
  expect(screen.getByRole("progressbar", { name: "Known" })).toHaveAttribute(
    "value",
    "100",
  );
  expect(
    screen.getByRole("progressbar", { name: "Unknown" }),
  ).not.toHaveAttribute("value");
});
for (const [name, Overlay] of [
  ["dialog", Dialog],
  ["drawer", Drawer],
] as const) {
  it(`${name} traps focus, dismisses with Escape and restores the trigger`, async () => {
    const user = userEvent.setup();
    render(
      <ThemeBoundary theme="studio">
        <Overlay
          title="Edit project"
          description="Change details"
          trigger={<Button>Open editor</Button>}
        >
          <TextInput label="Name" />
          <Button>Save</Button>
        </Overlay>
      </ThemeBoundary>,
    );
    const trigger = screen.getByRole("button", { name: "Open editor" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Edit project" });
    expect(dialog.closest("[data-ui-theme]")).toHaveAttribute(
      "data-ui-theme",
      "studio",
    );
    expect(dialog).toHaveAccessibleDescription("Change details");
    await user.tab({ shift: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });
}
it("blocks uncontrolled closing while busy, including DialogClose", async () => {
  const user = userEvent.setup();
  const view = render(
    <Dialog title="Busy" description="Wait" defaultOpen dismissible={false}>
      <DialogClose>Done</DialogClose>
    </Dialog>,
  );
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("button", { name: "Done" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Close dialog" })).toBeDisabled();
  view.rerender(
    <Dialog title="Busy" description="Wait" defaultOpen dismissible>
      <DialogClose>Done</DialogClose>
    </Dialog>,
  );
  await user.click(screen.getByRole("button", { name: "Done" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
it("keeps edited input after a failed controlled save", async () => {
  function Example() {
    const [open, setOpen] = useState(false),
      [error, setError] = useState(false);
    return (
      <Dialog
        title="Edit"
        description="Details"
        open={open}
        onOpenChange={setOpen}
        trigger={<Button>Open</Button>}
      >
        <TextInput label="Name" defaultValue="Draft" />
        <Button onClick={() => setError(true)}>Save</Button>
        {error && (
          <InlineAlert title="Save failed" error>
            Retry
          </InlineAlert>
        )}
      </Dialog>
    );
  }
  const user = userEvent.setup();
  render(<Example />);
  await user.click(screen.getByRole("button", { name: "Open" }));
  await user.type(screen.getByRole("textbox", { name: "Name" }), " edited");
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(
    within(screen.getByRole("dialog")).getByRole("alert"),
  ).toHaveTextContent("Save failed");
  expect(screen.getByRole("textbox")).toHaveValue("Draft edited");
});
it('keeps nested portals inside their own changing theme boundary',async()=>{
 const user=userEvent.setup();
 function Example({theme}:{theme:string}){return <ThemeBoundary theme="ledger"><ThemeBoundary theme={theme}><Dialog title="Nested" description="Themed" trigger={<Button>Open nested</Button>}>Details</Dialog></ThemeBoundary></ThemeBoundary>;}
 const view=render(<Example theme="studio"/>);await user.click(screen.getByRole('button',{name:'Open nested'}));expect(screen.getByRole('dialog').closest('[data-ui-theme]')).toHaveAttribute('data-ui-theme','studio');view.rerender(<Example theme="ledger"/>);expect(screen.getByRole('dialog').closest('[data-ui-theme]')).toHaveAttribute('data-ui-theme','ledger');
});
