import { useState } from "react";
import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CreatableSelect,
  type CreatableSelectProps,
} from "../src/components/ui/creatable-select";
import { ThemeBoundary } from "../src/components/ui/theme-boundary";
import { Dialog } from "../src/components/ui/dialog";
function Example(props: Partial<CreatableSelectProps>) {
  const [value, setValue] = useState("");
  return (
    <ThemeBoundary>
      <form aria-label="Example" onSubmit={(event) => event.preventDefault()}>
        <CreatableSelect
          label="Workspace"
          name="workspace"
          options={[{ value: "0001234567890123456789", label: "Harbour" }]}
          value={value}
          onValueChange={setValue}
          onCreate={async () => ({ value: "new", label: "Atlas" })}
          {...props}
        />
        <button type="submit">Save example</button>
      </form>
    </ThemeBoundary>
  );
}
it("selects through native radios and preserves the exact value in closed-popup FormData", async () => {
  const user = userEvent.setup();
  render(<Example />);
  await user.click(screen.getByRole("combobox", { name: "Workspace" }));
  await user.click(screen.getByRole("radio", { name: "Harbour" }));
  expect(
    screen.queryByRole("dialog", { name: "Workspace" }),
  ).not.toBeInTheDocument();
  expect(
    new FormData(
      screen.getByRole("form", { name: "Example" }) as HTMLFormElement,
    ).get("workspace"),
  ).toBe("0001234567890123456789");
  expect(screen.getByRole("combobox")).toHaveFocus();
});
it("retains creation input after failure and selects the returned option after retry", async () => {
  const user = userEvent.setup(),
    create = vi
      .fn()
      .mockRejectedValueOnce(new Error("Please retry."))
      .mockResolvedValueOnce({ value: "new-id", label: "Atlas" });
  render(<Example onCreate={create} />);
  await user.click(screen.getByRole("combobox"));
  await user.click(screen.getByRole("button", { name: "Create option" }));
  expect(screen.getByLabelText("New option name")).toHaveFocus();
  await user.type(screen.getByLabelText("New option name"), "Atlas");
  await user.click(screen.getByRole("button", { name: "Create option" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Please retry.");
  expect(screen.getByLabelText("New option name")).toHaveValue("Atlas");
  await user.click(screen.getByRole("button", { name: "Create option" }));
  await waitFor(() =>
    expect(screen.getByRole("combobox")).toHaveTextContent("Atlas"),
  );
  expect(create).toHaveBeenNthCalledWith(2, "Atlas");
  expect(
    new FormData(
      screen.getByRole("form", { name: "Example" }) as HTMLFormElement,
    ).get("workspace"),
  ).toBe("new-id");
  await user.click(screen.getByRole("combobox"));
  expect(screen.getByRole("radio", { name: "Atlas" })).toBeChecked();
});
it("blocks repeated creation and dismissal while pending", async () => {
  const user = userEvent.setup();
  let finish!: (option: { value: string; label: string }) => void;
  const create = vi.fn(
    () =>
      new Promise<{ value: string; label: string }>((resolve) => {
        finish = resolve;
      }),
  );
  const pending = vi.fn();
  render(<Example onCreate={create} onPendingChange={pending} />);
  await user.click(screen.getByRole("combobox"));
  await user.click(screen.getByRole("button", { name: "Create option" }));
  await user.type(screen.getByLabelText("New option name"), "Atlas");
  await user.click(screen.getByRole("button", { name: "Create option" }));
  await user.keyboard("{Escape}");
  expect(screen.getByRole("dialog", { name: "Workspace" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  expect(create).toHaveBeenCalledTimes(1);
  await act(async () => finish({ value: "new", label: "Atlas" }));
  expect(pending.mock.calls).toEqual([[true], [false]]);
});
it("keeps required validation connected to the visible trigger and excludes disabled fields", async () => {
  const { rerender } = render(<Example required />);
  const form = screen.getByRole("form", { name: "Example" }) as HTMLFormElement;
  act(() => {
    expect(form.checkValidity()).toBe(false);
  });
  expect(screen.getByRole("combobox")).toHaveFocus();
  expect(screen.getByRole("combobox")).toHaveAccessibleDescription(
    "Choose an option.",
  );
  rerender(<Example required disabled />);
  expect(new FormData(form).has("workspace")).toBe(false);
  expect(screen.getByRole("combobox")).toBeDisabled();
});
it("creates inside a dialog without submitting the parent form or losing its draft", async () => {
  const user = userEvent.setup(),
    submit = vi.fn((event) => event.preventDefault());
  function Nested() {
    const [value, setValue] = useState("");
    return (
      <ThemeBoundary>
        <Dialog defaultOpen title="Project" description="Fictional example">
          <form aria-label="Project form" onSubmit={submit}>
            <input aria-label="Project name" defaultValue="Unsent draft" />
            <CreatableSelect
              label="Workspace"
              name="workspace"
              value={value}
              onValueChange={setValue}
              options={[]}
              onCreate={async () => ({ value: "atlas", label: "Atlas" })}
            />
          </form>
        </Dialog>
      </ThemeBoundary>
    );
  }
  render(<Nested />);
  await user.click(screen.getByRole("combobox"));
  await user.click(screen.getByRole("button", { name: "Create option" }));
  await user.type(screen.getByLabelText("New option name"), "Atlas{Enter}");
  await waitFor(() =>
    expect(screen.getByRole("combobox")).toHaveTextContent("Atlas"),
  );
  expect(submit).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Project name")).toHaveValue("Unsent draft");
  expect(screen.getByRole("dialog", { name: "Project" })).toBeVisible();
});
