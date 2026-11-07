import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Button, IconButton } from "../src/components/ui/button";
import { TextInput, CurrencyInput, Select } from "../src/components/ui/fields";
import {
  FilterBar,
  FilterActions,
  FilterDisclosure,
} from "../src/components/patterns/filter-bar";
import { FormSection } from "../src/components/patterns/form-section";
it("prevents dispatch while loading and keeps ordinary buttons out of form submissions", async () => {
  const click = vi.fn();
  render(
    <Button loading onClick={click}>
      Save
    </Button>,
  );
  await userEvent.click(screen.getByRole("button"));
  expect(click).not.toHaveBeenCalled();
  expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
});
it("labels icon-only actions", () => {
  render(<IconButton label="Add project">+</IconButton>);
  expect(screen.getByRole("button", { name: "Add project" })).toHaveAttribute(
    "title",
    "Add project",
  );
});
it("associates labels, caller descriptions and validation without duplicate ids", () => {
  render(
    <>
      <p id="extra">Do not share this name</p>
      <TextInput
        label="First"
        description="Project name"
        error="Required"
        aria-describedby="extra"
      />
      <TextInput label="Second" />
    </>,
  );
  const first = screen.getByLabelText("First");
  expect(first).toHaveAccessibleDescription(
    "Project name Required Do not share this name",
  );
  expect(first).toHaveAttribute("aria-invalid", "true");
  expect(first.id).not.toBe(screen.getByLabelText("Second").id);
});
it("preserves exact decimal input and native form data", () => {
  const change = vi.fn();
  render(
    <form aria-label="Example">
      <CurrencyInput
        label="Amount"
        name="amount"
        value="00123.4500"
        onValueChange={change}
      />
    </form>,
  );
  expect(
    new FormData(screen.getByRole("form") as HTMLFormElement).get("amount"),
  ).toBe("00123.4500");
  fireEvent.change(screen.getByLabelText("Amount"), {
    target: { value: "9007199254740993.123456" },
  });
  expect(change).toHaveBeenCalledWith("9007199254740993.123456");
});
it("preserves grouped select options, disabled choices and caller accessibility props", () => {
  render(
    <>
      <p id="help">Select an owner</p>
      <Select
        label="Owner"
        aria-invalid="true"
        aria-describedby="help"
        className="custom"
        options={[
          { value: "a", label: "Alex", group: "People" },
          { value: "s", label: "Sam", group: "People", disabled: true },
        ]}
      />
    </>,
  );
  const select = screen.getByRole("combobox");
  expect(select).toHaveClass("ds-select", "custom");
  expect(select).toHaveAccessibleDescription("Select an owner");
  expect(select).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByRole("option", { name: "Sam" })).toBeDisabled();
});
it("supports keyboard editing in a labelled filter group without inventing toolbar navigation", async () => {
  function Example() {
    const [query, setQuery] = useState("");
    return (
      <FilterBar label="Project filters">
        <TextInput
          label="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <FilterActions>
          <Button onClick={() => setQuery("")}>Reset</Button>
        </FilterActions>
      </FilterBar>
    );
  }
  render(<Example />);
  await userEvent.tab();
  await userEvent.keyboard("harbour");
  expect(screen.getByLabelText("Search")).toHaveValue("harbour");
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "Reset" })).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  expect(screen.getByLabelText("Search")).toHaveValue("");
  expect(screen.queryByRole("toolbar")).toBeNull();
});
it("uses native disclosure and opens when active filters need to be visible", () => {
  render(
    <FilterDisclosure active>
      <TextInput label="Category" />
    </FilterDisclosure>,
  );
  expect(screen.getByText("More filters").parentElement).toHaveAttribute(
    "open",
  );
  expect(screen.getByLabelText("Category")).toBeVisible();
});
it("connects form section descriptions and retains native required validation", () => {
  render(
    <form aria-label="Project">
      <FormSection id="project" title="Details" description="Project settings">
        <TextInput label="Name" name="name" required />
      </FormSection>
    </form>,
  );
  expect(
    screen.getByRole("group", { name: "Details" }),
  ).toHaveAccessibleDescription("Project settings");
  expect((screen.getByRole("form") as HTMLFormElement).checkValidity()).toBe(
    false,
  );
});
