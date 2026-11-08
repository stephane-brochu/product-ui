import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import {
  AppShell,
  Header,
  PrimaryNavigation,
  Sidebar,
  SectionNavigation,
  Breadcrumbs,
} from "../src/components/patterns/navigation";
import { MobileNavigation } from "../src/components/patterns/mobile-navigation";
import { FormFeedback } from "../src/components/patterns/form-feedback";
import { ConfirmationDialog } from "../src/components/patterns/confirmation-dialog";
import { RepeatableFields } from "../src/components/patterns/repeatable-fields";
import { FileSelection } from "../src/components/patterns/file-selection";
import { UploadQueue } from "../src/components/patterns/upload-queue";
import {
  ReviewLayout,
  HistoryTimeline,
} from "../src/components/patterns/review-layout";
import { ThemeBoundary } from "../src/components/ui/theme-boundary";
import { Button } from "../src/components/ui/button";
const items = [
  { label: "Projects", href: "#projects" },
  { label: "People", href: "#people" },
  { label: "Unavailable", href: "#later", disabled: true },
];
it("server renders supplied branding/navigation with a single main and accurate link semantics", () => {
  const html = renderToString(
    <AppShell
      mainId="content"
      header={
        <Header
          brand={<a href="/">Other product</a>}
          navigation={<PrimaryNavigation items={items} activeHref="#people" />}
        />
      }
      sidebar={<Sidebar label="Workspace" items={items} />}
    >
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "People" }]}
      />
      <SectionNavigation
        label="Sections"
        items={items}
        activeHref="#projects"
      />
      <ReviewLayout evidence={<p>Original</p>}>
        <HistoryTimeline events={[]} />
      </ReviewLayout>
    </AppShell>,
  );
  expect(html).toContain('href="#content"');
  expect(html.match(/<main/g)).toHaveLength(1);
  expect(html).toContain('aria-current="location"');
  expect(html).not.toContain("Finances");
  render(<PrimaryNavigation items={items} activeHref="#people" />);
  expect(screen.getByRole("link", { name: "People" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(
    screen.queryByRole("link", { name: "Unavailable" }),
  ).not.toBeInTheDocument();
});
it("closes mobile links on Escape with focus restoration, navigation, outside focus/pointer and route key changes", async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <>
      <MobileNavigation items={items} navigationKey="one" />
      <button>Outside</button>
    </>,
  );
  await user.click(screen.getByRole("button", { name: "Menu" }));
  await user.tab();
  expect(screen.getByRole("link", { name: "Projects" })).toHaveFocus();
  await user.keyboard("{Escape}");
  expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus();
  await user.click(screen.getByRole("button", { name: "Menu" }));
  await user.click(screen.getByRole("link", { name: "People" }));
  expect(
    screen.queryByRole("link", { name: "People" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Menu" }));
  fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));
  expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await user.click(screen.getByRole("button", { name: "Menu" }));
  rerender(<MobileNavigation items={items} navigationKey="two" />);
  expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
it("retains original href and caller Link adapters", () => {
  render(
    <PrimaryNavigation
      items={items}
      linkComponent={(props) => <a {...props} data-adapter="native" />}
    />,
  );
  expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "href",
    "#projects",
  );
  expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "data-adapter",
    "native",
  );
});
it("feedback prioritizes pending, announces errors and delegates retry without clearing fields", async () => {
  const retry = vi.fn(),
    user = userEvent.setup();
  const { rerender } = render(
    <>
      <input aria-label="Entry" defaultValue="Retained" />
      <FormFeedback pending error="Old error" />
    </>,
  );
  expect(screen.getByRole("status")).toHaveTextContent("Saving");
  expect(screen.queryByRole("alert")).toBeNull();
  rerender(
    <>
      <input aria-label="Entry" defaultValue="Retained" />
      <FormFeedback error="Failed" onRetry={retry} />
    </>,
  );
  await user.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledOnce();
  expect(screen.getByLabelText("Entry")).toHaveValue("Retained");
});
it("confirmation focuses Cancel, blocks duplicate/dismissal while pending, retains failure and allows retry", async () => {
  let reject!: (error: Error) => void;
  const onConfirm = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((_, no) => {
          reject = no;
        }),
    )
    .mockResolvedValueOnce(undefined);
  const user = userEvent.setup();
  render(
    <ThemeBoundary theme="studio">
      <ConfirmationDialog
        title="Archive?"
        description="Original is retained."
        trigger={<Button>Archive</Button>}
        onConfirm={onConfirm}
      />
    </ThemeBoundary>,
  );
  const trigger = screen.getByRole("button", { name: "Archive" });
  await user.click(trigger);
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus(),
  );
  await user.dblClick(screen.getByRole("button", { name: "Confirm" }));
  expect(onConfirm).toHaveBeenCalledOnce();
  await user.keyboard("{Escape}");
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  reject(new Error("failure"));
  expect(await screen.findByRole("alert")).toHaveTextContent("try again");
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Confirm" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(onConfirm).toHaveBeenCalledTimes(2);
  await waitFor(() => expect(trigger).toHaveFocus());
});
it("repeatable fields preserve stable rows, limits, and focus when adding/removing", async () => {
  function Example() {
    const [rows, setRows] = useState([{ id: "a", value: "Alpha" }]);
    return (
      <RepeatableFields
        label="Members"
        maxItems={2}
        minItems={1}
        items={rows.map((row) => ({
          id: row.id,
          label: row.id,
          content: (
            <input aria-label={`Name ${row.id}`} defaultValue={row.value} />
          ),
        }))}
        onAdd={() => setRows([...rows, { id: "b", value: "Beta" }])}
        onRemove={(id) => setRows(rows.filter((row) => row.id !== id))}
      />
    );
  }
  const user = userEvent.setup();
  render(<Example />);
  expect(screen.getByRole("button", { name: "Remove a" })).toBeDisabled();
  await user.type(screen.getByLabelText("Name a"), " updated");
  await user.click(screen.getByRole("button", { name: "Add row" }));
  expect(screen.getByLabelText("Name b")).toHaveFocus();
  expect(screen.getByRole("button", { name: "Add row" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Remove b" }));
  expect(screen.getByLabelText("Name a")).toHaveValue("Alpha updated");
  expect(screen.getByRole("button", { name: "Add row" })).toHaveFocus();
});
it("selects exact file objects, rejects invalid batches, accepts MIME wildcards/extensions and permits same-file retry", async () => {
  const selected = vi.fn();
  const user = userEvent.setup({ applyAccept: false });
  render(
    <FileSelection
      label="Attachments"
      accept={["application/pdf", ".txt", "image/*"]}
      maxBytes={8}
      onFiles={selected}
    />,
  );
  const valid = new File(["data"], "original.pdf", { type: "application/pdf" }),
    text = new File(["hi"], "notes.TXT"),
    bad = new File(["x"], "bad.exe"),
    empty = new File([], "empty.pdf", { type: "application/pdf" }),
    large = new File(["123456789"], "large.pdf", { type: "application/pdf" });
  await user.upload(screen.getByLabelText("Attachments"), [
    valid,
    text,
    bad,
    empty,
    large,
    valid,
  ]);
  expect(selected).toHaveBeenCalledWith([valid, text]);
  expect(selected.mock.calls[0][0][0]).toBe(valid);
  expect(screen.getByRole("alert")).toHaveTextContent("unsupported");
  expect(screen.getByRole("alert")).toHaveTextContent("empty");
  expect(screen.getByRole("alert")).toHaveTextContent("size limit");
  expect(screen.getByRole("alert")).toHaveTextContent("possible duplicate");
  await user.upload(screen.getByLabelText("Attachments"), valid);
  expect(selected).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole("alert")).toBeNull();
});
it("disabled selection ignores dropped files; single selection returns at most one", () => {
  const selected = vi.fn();
  const { rerender, container } = render(
    <FileSelection label="One file" disabled onFiles={selected} />,
  );
  const files = [new File(["a"], "a.txt"), new File(["b"], "b.txt")];
  fireEvent.drop(container.querySelector(".ds-file-dropzone")!, {
    dataTransfer: { files },
  });
  expect(selected).not.toHaveBeenCalled();
  rerender(
    <FileSelection label="One file" multiple={false} onFiles={selected} />,
  );
  fireEvent.drop(container.querySelector(".ds-file-dropzone")!, {
    dataTransfer: { files },
  });
  expect(selected).toHaveBeenCalledWith([files[0]]);
  expect(screen.getByRole("alert")).toHaveTextContent("one file");
});
it("queue delegates actions and history keeps supplied order and provenance without network operations", async () => {
  const retry = vi.fn();
  render(
    <>
      <UploadQueue
        items={[
          {
            id: "file",
            name: "original.pdf",
            status: "Failed",
            progress: 120,
            actions: <button onClick={retry}>Resume</button>,
          },
        ]}
      />
      <HistoryTimeline
        events={[
          {
            id: "new",
            title: "Reviewed",
            dateLabel: "Today",
            dateTime: "2026-11-08",
            source: <a href="/source/2">Original evidence</a>,
          },
          { id: "old", title: "Received", dateLabel: "Yesterday" },
        ]}
      />
    </>,
  );
  expect(screen.getByRole("progressbar")).toHaveAttribute("value", "100");
  await userEvent.click(screen.getByRole("button", { name: "Resume" }));
  expect(retry).toHaveBeenCalledOnce();
  expect(
    screen.getByRole("link", { name: "Original evidence" }),
  ).toHaveAttribute("href", "/source/2");
  expect(
    within(screen.getByLabelText("History")).getAllByRole("listitem")[0],
  ).toHaveTextContent("Reviewed");
});
