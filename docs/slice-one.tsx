import { useState, type FormEvent } from "react";
import { Button } from "../src/components/ui/button";
import { Textarea, TextInput, Select } from "../src/components/ui/fields";
import { Checkbox } from "../src/components/ui/checkbox";
import {
  PageContainer,
  PageHeader,
  SectionHeader,
} from "../src/components/patterns/page-layout";
import {
  InlineAlert,
  EmptyState,
  ErrorState,
  StatusBadge,
  LoadingIndicator,
  ProgressIndicator,
} from "../src/components/ui/feedback";
import { Dialog, Drawer } from "../src/components/ui/dialog";
function Editor({ drawer = false }: { drawer?: boolean }) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [fail, setFail] = useState(true),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false),
    [name, setName] = useState("Harbour project");
  const Overlay = drawer ? Drawer : Dialog;
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    await new Promise((resolve) => setTimeout(resolve, 900));
    setBusy(false);
    if (fail) {
      setError(
        "The preview could not save. Your changes are still here. Turn off simulated failure to retry.",
      );
      return;
    }
    setOpen(false);
    setSaved(true);
  }
  return (
    <div>
      <Overlay
        title={drawer ? "Edit project in drawer" : "Edit project"}
        description="Synthetic preview. Changes stay in this browser."
        trigger={
          <Button variant="secondary" onClick={() => setSaved(false)}>
            Open {drawer ? "drawer" : "dialog"}
          </Button>
        }
        open={open}
        onOpenChange={setOpen}
        dismissible={!busy}
      >
        <form className="overlay-example-form" onSubmit={save}>
          <TextInput
            label="Project name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            label="Notes"
            defaultValue="A reusable workspace for our team."
            description="Try editing, failing a save, then retrying."
          />
          <Checkbox
            label="Simulate save failure"
            checked={fail}
            onChange={(e) => setFail(e.target.checked)}
            disabled={busy}
          />
          {error && (
            <InlineAlert title="Save failed" error>
              {error}
            </InlineAlert>
          )}
          <div className="ds-dialog-actions">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Save changes
            </Button>
          </div>
        </form>
      </Overlay>
      {saved && <p role="status">Saved in this preview.</p>}
    </div>
  );
}
export function SliceOne() {
  const [state, setState] = useState("empty"),
    [invalid, setInvalid] = useState(false);
  return (
    <>
      <section id="page-layout">
        <p className="eyebrow">Page foundations</p>
        <h2>Layout with meaningful headings.</h2>
        <p>
          PageContainer controls width and gutters. PageHeader defaults to h1;
          SectionHeader defaults to h2. Set headingLevel to fit the surrounding
          document. Native attributes and action slots are preserved.
        </p>
        <div className="demo">
          <PageContainer>
            <PageHeader
              headingLevel={3}
              eyebrow="Workspace"
              title="Harbour project"
              description="Long titles and actions wrap on narrow screens."
              action={<Button variant="secondary">Project action</Button>}
            />
            <SectionHeader
              headingLevel={4}
              number="01"
              title="Project details"
              description="Compose content here; the layout owns no data."
            />
          </PageContainer>
        </div>
      </section>
      <section id="feedback">
        <p className="eyebrow">Feedback & status</p>
        <h2>Make every state reviewable.</h2>
        <div className="button-row">
          {(["neutral", "info", "success", "warning", "danger"] as const).map(
            (tone) => (
              <StatusBadge tone={tone} key={tone}>
                {tone}
              </StatusBadge>
            ),
          )}
        </div>
        <p>
          Use visible text to explain status. Tone is an explicit product
          decision. Alerts default to role=note; danger uses role=alert.
          ErrorState provides a retry callback; the product owns the request.
        </p>
        <Select
          label="Preview state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          options={["loading", "empty", "error", "success"].map((value) => ({
            value,
            label: value,
          }))}
        />
        <div className="demo">
          {state === "loading" ? (
            <>
              <LoadingIndicator label="Loading projects" />
              <ProgressIndicator label="Import progress" value={42} />
              <ProgressIndicator label="Waiting for response" />
            </>
          ) : state === "empty" ? (
            <EmptyState
              title="No projects yet"
              action={
                <Button onClick={() => setState("success")}>
                  Create preview project
                </Button>
              }
            >
              Start with a project for your team.
            </EmptyState>
          ) : state === "error" ? (
            <ErrorState
              title="Projects could not load"
              onRetry={() => setState("success")}
            >
              Try again when you are ready.
            </ErrorState>
          ) : (
            <InlineAlert
              title="Project ready"
              tone="success"
              action={
                <Button variant="tertiary" onClick={() => setState("empty")}>
                  Reset preview
                </Button>
              }
            >
              Your preview project is available.
            </InlineAlert>
          )}
        </div>
      </section>
      <section id="extended-fields">
        <p className="eyebrow">Native fields</p>
        <h2>Checkbox & Textarea.</h2>
        <p>
          Caller IDs, names, values and aria-describedby are preserved. Labels,
          descriptions and validation messages are linked. Checkbox supports
          indeterminate and an input ref. Textarea supports native required,
          readOnly, disabled and rows.
        </p>
        <div className="demo">
          <Checkbox
            label="Show validation errors"
            checked={invalid}
            onChange={(e) => setInvalid(e.target.checked)}
          />
          <Checkbox
            id="terms-preview"
            label="I agree to the project terms"
            name="terms"
            value="accepted"
            description="A native checkbox, ready for form serialization."
            error={invalid ? "Accept the terms to continue." : undefined}
          />
          <Checkbox label="Some items selected" indeterminate />
          <Checkbox label="Unavailable option" disabled />
          <Textarea
            label="Project notes"
            description="Use multiple lines. Resize as needed."
            error={invalid ? "Enter a short note." : undefined}
            defaultValue="A short project brief."
          />
          <Textarea
            label="Read-only notes"
            readOnly
            defaultValue="Shared with the team."
          />
          <Textarea
            label="Unavailable notes"
            disabled
            defaultValue="Editing is unavailable."
          />
        </div>
      </section>
      <section id="overlays">
        <p className="eyebrow">Optional overlays</p>
        <h2>Dialog & Drawer.</h2>
        <p>
          Open, edit, trigger an error and retry. Tab stays inside; Escape or
          the close button dismisses and restores focus to the trigger. While
          saving, dismissal is blocked. Inputs remain intact after a failed
          save.
        </p>
        <div className="button-row">
          <Editor />
          <Editor drawer />
        </div>
        <p>
          Requires <code>@radix-ui/react-dialog@1.3.1</code>. Install dialog
          separately from core. Wrap your product in ThemeBoundary so portal
          content inherits its selected theme; without it portals use the
          document theme. Title and description are required. Route navigation,
          server actions, unsaved-change policy and notification queues belong
          to the product.
        </p>
        <pre>
          <code>{`npm install --save-exact @radix-ui/react-dialog@1.3.1
npx shadcn@4.23.0 add https://brochu-product-ui.vercel.app/r/v0.5.0/dialog.json

<ThemeBoundary theme="ledger">
  <Dialog title="Edit project" description="Update details"
    trigger={<Button>Edit</Button>}>...</Dialog>
</ThemeBoundary>`}</code>
        </pre>
        <p>
          Import ui-theme.css, ui-controls.css and ui-dialog.css once. Add
          ui-feedback.css and ui-layout.css when using their components.{" "}
          <a href="https://github.com/stephane-brochu/product-ui/blob/v0.4.0/docs/component-contracts.md">
            Read the component contracts
          </a>{" "}
          for APIs, accessibility, state coverage and limits.
        </p>
      </section>
    </>
  );
}
