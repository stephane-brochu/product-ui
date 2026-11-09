import { useState } from "react";
import { CreatableSelect } from "../src/components/ui/creatable-select";
import { Button } from "../src/components/ui/button";
import { Dialog } from "../src/components/ui/dialog";
import { TextInput, Select } from "../src/components/ui/fields";
import "../src/styles/ui-creatable.css";
export function CreatableSelection() {
  const [value, setValue] = useState("harbour"),
    [outcome, setOutcome] = useState("failure"),
    [disabled, setDisabled] = useState(false),
    [pending, setPending] = useState(false),
    [message, setMessage] = useState("");
  const [name, setName] = useState("Unsent project draft");
  const [options, setOptions] = useState([
    { value: "harbour", label: "Harbour" },
    { value: "atlas", label: "Atlas" },
  ]);
  async function create(label: string) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    if (outcome === "failure")
      throw new Error(
        "Example creation failed. Your name is still here; choose success and retry.",
      );
    const existing = options.find(
      (option) => option.label.toLowerCase() === label.toLowerCase(),
    );
    const option = existing ?? { value: crypto.randomUUID(), label };
    setOptions((current) => (existing ? current : [...current, option]));
    return option;
  }
  return (
    <section id="creatable-selection">
      <p className="eyebrow">SELECTION AND CREATION</p>
      <h2>Create an option without losing the form.</h2>
      <p>
        Open the dropdown and choose Create workspace. Its inline editor keeps
        your input on failure and selects the returned option on success.
        Creation is a supplied callback; this example makes no request.
      </p>
      <label>
        <input
          type="checkbox"
          checked={disabled}
          onChange={(event) => setDisabled(event.target.checked)}
        />{" "}
        Disable example selection
      </label>
      <Dialog
        title="Example project"
        description="Fictional data. Try creation inside a dialog, then inspect the exact selected form value."
        trigger={<Button>Open creation example</Button>}
        dismissible={!pending}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setMessage(`Submitted locally: ${String(data.get("workspace"))}`);
          }}
        >
          <Select
            label="Creation outcome"
            value={outcome}
            onChange={(event) => setOutcome(event.target.value)}
            options={[
              { value: "failure", label: "Simulate failure" },
              { value: "success", label: "Simulate success" },
            ]}
          />
          <TextInput
            label="Project name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <CreatableSelect
            label="Workspace"
            name="workspace"
            required
            options={options}
            value={value}
            onValueChange={setValue}
            onCreate={create}
            onPendingChange={setPending}
            disabled={disabled}
            createLabel="Create workspace"
            createInputLabel="Workspace name"
          />
          <Button type="submit" disabled={pending}>
            Inspect selected value
          </Button>
          {message && <p role="status">{message}</p>}
        </form>
      </Dialog>
      <p>
        The control uses a dialog popup with native radio choices, not a
        searchable listbox. A native form control retains the selected value and
        required validation. Escape restores focus; pending creation blocks
        dismissal. Products own persistence, permissions, duplicate-name policy
        and parent-dialog dismissal while pending.
      </p>
      <pre>
        <code>{`npx shadcn@4.23.0 add https://brochu-product-ui.vercel.app/r/v0.7.0/creatable-select.json
// Import ui-creatable.css plus the documented popover/selection styles.
<CreatableSelect label="Workspace" name="workspace" required
  value={workspace} options={options} onValueChange={setWorkspace}
  onCreate={async label => productCreateWorkspace(label)} />`}</code>
      </pre>
      <a href="https://github.com/stephane-brochu/product-ui/blob/v0.7.0/docs/migrations/v0.7.0.md">
        Creation, validation, cancellation and ownership contracts
      </a>
    </section>
  );
}
