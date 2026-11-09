import { CreatableSelection } from "./creatable-selection";
import { AdvancedRenderers } from "./advanced-renderers";
import "../src/styles/ui-charts.css";
import "../src/styles/ui-pdf.css";
import { NavigationWorkflows } from "./navigation-workflows";
import "../src/styles/ui-navigation.css";
import "../src/styles/ui-workflows.css";
import { DataPresentation } from "./data-presentation";
import "../src/styles/ui-data.css";
import "../src/styles/ui-metrics.css";
import { MilestoneOne } from "./milestone-one";
import "../src/styles/ui-composition.css";
import "../src/styles/ui-floating.css";
import { SliceOne } from "./slice-one";
import { ThemeBoundary } from "../src/components/ui/theme-boundary";
import "../src/styles/ui-layout.css";
import "../src/styles/ui-feedback.css";
import "../src/styles/ui-dialog.css";
import { createRoot } from "react-dom/client";
import { useState, type FormEvent } from "react";
import { Button, IconButton } from "../src/components/ui/button";
import {
  TextInput,
  CurrencyInput,
  SearchInput,
  Select,
  MonthPicker,
} from "../src/components/ui/fields";
import {
  FilterBar,
  FilterActions,
  FilterDisclosure,
} from "../src/components/patterns/filter-bar";
import {
  FormSection,
  FormActions,
} from "../src/components/patterns/form-section";
import "../src/styles/ui-theme.css";
import "../src/styles/ui-controls.css";
import "../src/styles/ui-patterns.css";
import "./site.css";
const base = "https://brochu-product-ui.vercel.app/r/v0.7.0";
const install = `npx shadcn@4.23.0 add ${base}/core.json`;
function Code({ children }: { children: string }) {
  return (
    <pre>
      <code>{children}</code>
    </pre>
  );
}
function App() {
  const [theme, setTheme] = useState("ledger");
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [name, setName] = useState("Harbour project");
  const [amount, setAmount] = useState("1234.5600");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const rows = [
    { name: "Harbour project", owner: "Alex", status: "active" },
    { name: "Meadow project", owner: "Sam", status: "archived" },
  ].filter(
    (row) =>
      (!status || row.status === status) &&
      `${row.name} ${row.owner}`.toLowerCase().includes(search.toLowerCase()),
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(install);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  function save(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    if (!name.trim()) {
      setError("Enter a project name.");
      return;
    }
    setError("");
    setSaved(true);
  }
  return (
    <ThemeBoundary theme={theme}>
      <div className="docs" data-ui-theme={theme}>
        <a className="skip-link" href="#main">
          Skip to documentation
        </a>
        <header className="masthead">
          <a className="wordmark" href="#">
            Product UI<span> / 0.7.0</span>
          </a>
          <div className="header-actions">
            <a href="https://github.com/stephane-brochu/product-ui">Source</a>
            <Select
              label="Theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              options={[
                { value: "ledger", label: "Ledger" },
                { value: "studio", label: "Studio" },
              ]}
            />
          </div>
        </header>
        <div className="docs-layout">
          <aside>
            <p className="eyebrow">Library guide</p>
            <nav aria-label="Documentation">
              <a href="#start">Get started</a>
              <a href="#foundations">Foundations</a>
              <a href="#buttons">Buttons</a>
              <a href="#fields">Fields</a>
              <a href="#filters">Filter bar</a>
              <a href="#forms">Form sections</a>
              <a href="#page-layout">Page layout</a>
              <a href="#feedback">Feedback</a>
              <a href="#extended-fields">Checkbox & Textarea</a>
              <a href="#overlays">Dialog & Drawer</a>
              <a href="#selection-native">Selection controls</a>
              <a href="#creatable-selection">Create within selection</a>
              <a href="#disclosures-settings">Disclosures & settings</a>
              <a href="#floating-controls">Popover & menus</a>
              <a href="#data-presentation">Data tables</a>
              <a href="#application-navigation">Navigation</a>
              <a href="#advanced-charts">Advanced charts</a>
              <a href="#pdf-preview">PDF preview</a>
              <a href="#form-review-workflows">Forms & review</a>
              <a href="#metric-values">Metrics & values</a>
              <a href="#extend">Extend the library</a>
              <a href="#releases">Releases & upgrades</a>
            </nav>
            <p className="aside-note">
              React 19
              <br />
              Owned source
              <br />
              MIT licensed
            </p>
          </aside>
          <main id="main">
            <section className="hero" id="start">
              <p className="eyebrow">
                Shared foundations / navigation and workflows
              </p>
              <h1>
                A shared language
                <br />
                for useful products.
              </h1>
              <p className="lead">
                Accessible controls, composable patterns, and product themes.
                Install the source you need, then build on a version you can
                trace.
              </p>
              <div className="install-row">
                <Code>{install}</Code>
                <Button variant="secondary" onClick={copy}>
                  {copied ? "Copied" : "Copy command"}
                </Button>
              </div>
              <p className="note">
                Use an existing shadcn-configured React 19 app, or the{" "}
                <a href="https://github.com/stephane-brochu/product-ui/tree/v0.7.0/templates/react">
                  included Vite starter
                </a>
                . Registry files and their dependencies are pinned to v0.7.0.
              </p>
            </section>
            <section id="foundations">
              <p className="eyebrow">01 / Foundations</p>
              <h2>One contract. Different products.</h2>
              <p>
                Switch the theme above: the controls keep their APIs and
                behaviour. Colours, typography, focus, radii and target sizes
                come from semantic <code>--ui-*</code> roles.
              </p>
              <div className="swatches">
                {[
                  "background",
                  "foreground",
                  "primary",
                  "muted",
                  "input",
                  "destructive",
                ].map((token) => (
                  <div key={token}>
                    <span style={{ background: `var(--ui-${token})` }} />
                    <code>{token}</code>
                  </div>
                ))}
              </div>
              <Code>{`import "./styles/ui-theme.css";
import "./styles/ui-controls.css";
import "./styles/ui-patterns.css";

// Choose a theme on the product root:
<div data-ui-theme="studio">...</div>`}</Code>
              <p className="note">
                The source uses ds-* classes and prefixed semantic tokens; no
                Tailwind plugin or runtime styling service is required. Fonts
                fall back to local system fonts. Do not replace a product's
                global CSS with stock shadcn theme output.
              </p>
            </section>
            <section id="buttons">
              <p className="eyebrow">02 / Components</p>
              <h2>Buttons</h2>
              <p>
                Actions use native buttons; navigation uses your router's link
                with <code>buttonClassName()</code>. The default button type is
                button.
              </p>
              <div className="example">
                <FilterActions>
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="tertiary">Tertiary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button loading>Saving</Button>
                  <Button disabled>Unavailable</Button>
                  <IconButton label="Add example">+</IconButton>
                </FilterActions>
              </div>
              <Code>{`<Button type="submit" loading={pending}>Save</Button>
<IconButton label="Add project">+</IconButton>`}</Code>
              <dl className="api">
                <dt>variant</dt>
                <dd>primary · secondary · tertiary · destructive</dd>
                <dt>size</dt>
                <dd>
                  compact · default · large; mobile targets stay at least 44px
                </dd>
                <dt>loading</dt>
                <dd>Disables dispatch and exposes aria-busy</dd>
              </dl>
            </section>
            <section id="fields">
              <h2>Native fields</h2>
              <p>
                Labels, descriptions, errors, custom IDs and native form
                attributes stay connected. Currency edits preserve exact
                strings, including trailing zeroes.
              </p>
              <div className="example fields-grid">
                <TextInput
                  label="Project name"
                  description="A name people recognize"
                  defaultValue="Harbour"
                />
                <Select
                  label="Owner"
                  options={[
                    { value: "alex", label: "Alex" },
                    { value: "sam", label: "Sam" },
                  ]}
                />
                <CurrencyInput
                  label="Example amount"
                  currency="CAD"
                  value={amount}
                  onValueChange={setAmount}
                />
                <MonthPicker label="Planning month" defaultValue="2026-11" />
              </div>
              <p className="note">
                Current exact input: <code>{amount || "(empty)"}</code>
              </p>
              <Code>{`<TextInput label="Name" name="name" required error={error} />
<CurrencyInput label="Amount" value={amount} onValueChange={setAmount} />`}</Code>
              <dl className="api">
                <dt>Exports</dt>
                <dd>
                  FormField, TextInput, NumberInput, CurrencyInput, SearchInput,
                  Select, DatePicker, MonthPicker
                </dd>
                <dt>Common props</dt>
                <dd>
                  label, description, error, id, name, required, disabled,
                  readOnly, className, fieldClassName
                </dd>
                <dt>Select</dt>
                <dd>
                  Native value/onChange, grouped options, disabled options
                </dd>
              </dl>
            </section>
            <section id="filters">
              <p className="eyebrow">03 / Product patterns</p>
              <h2>Filter bar</h2>
              <p>
                A labelled group of controls with normal Tab navigation. The
                product owns the query, filtering and URL.
              </p>
              <div className="example">
                <FilterBar label="Project filters">
                  <SearchInput
                    label="Search projects"
                    fieldClassName="ds-filter-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Name or owner"
                  />
                  <Select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                      { value: "", label: "All projects" },
                      { value: "active", label: "Active" },
                      { value: "archived", label: "Archived" },
                    ]}
                  />
                  <FilterActions>
                    <Button
                      variant="secondary"
                      disabled={!search && !status}
                      onClick={() => {
                        setSearch("");
                        setStatus("");
                      }}
                    >
                      Clear filters
                    </Button>
                  </FilterActions>
                </FilterBar>
                <FilterDisclosure>
                  <p>
                    Place product-specific controls here. This disclosure uses
                    native details and summary.
                  </p>
                </FilterDisclosure>
                <p role="status" className="note">
                  {rows.length} {rows.length === 1 ? "project" : "projects"}
                </p>
                <ul className="results">
                  {rows.map((row) => (
                    <li key={row.name}>
                      <strong>{row.name}</strong>
                      <span>
                        {row.owner} · {row.status}
                      </span>
                    </li>
                  ))}
                </ul>
                {!rows.length && (
                  <p>No projects match. Clear the filters to start again.</p>
                )}
              </div>
              <Code>{`<FilterBar label="Project filters">
  <SearchInput label="Search" value={query} onChange={onSearch} />
  <FilterActions><Button type="submit">Apply</Button></FilterActions>
</FilterBar>`}</Code>
            </section>
            <section id="forms">
              <h2>Form sections</h2>
              <p>
                Use fieldset and legend to group related fields. Unique section
                IDs connect descriptions. The pattern never inserts a form or
                owns persistence.
              </p>
              <form
                className="example"
                aria-label="Example project settings"
                onSubmit={save}
                noValidate
              >
                <FormSection
                  id="example-project"
                  title="Project details"
                  description="Try saving with an empty name to inspect validation."
                >
                  <TextInput
                    label="Example project name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSaved(false);
                    }}
                    error={error || undefined}
                    required
                  />
                  <Select
                    label="Project owner"
                    options={[
                      { value: "alex", label: "Alex" },
                      { value: "sam", label: "Sam" },
                    ]}
                  />
                  <FormActions>
                    <Button type="submit">Save example</Button>
                  </FormActions>
                </FormSection>
                {saved && (
                  <p role="status">
                    Saved in this preview only. No request was sent.
                  </p>
                )}
              </form>
              <Code>{`<FormSection id="details" title="Details" description="...">
  <TextInput label="Name" name="name" />
  <FormActions><Button type="submit">Save</Button></FormActions>
</FormSection>`}</Code>
            </section>
            <SliceOne />
            <MilestoneOne />
            <DataPresentation />
            <NavigationWorkflows />
            <AdvancedRenderers />
            <CreatableSelection />
            <section id="extend">
              <p className="eyebrow">04 / Working together</p>
              <h2>Extend with evidence.</h2>
              <ol>
                <li>
                  Start from a real product need. Keep domain models and
                  persistence in that product.
                </li>
                <li>
                  Build the generic API here. Add keyboard, validation and
                  responsive examples.
                </li>
                <li>
                  Run type checks, interaction tests, registry validation and
                  the docs build.
                </li>
                <li>
                  Bump the version; generate a new immutable release snapshot
                  and migration notes.
                </li>
                <li>
                  Review the source diff, then update each product's pinned
                  copy.
                </li>
              </ol>
              <p>
                <a href="https://github.com/stephane-brochu/product-ui/blob/main/CONTRIBUTING.md">
                  Contribution guide
                </a>{" "}
                ·{" "}
                <a href="https://github.com/stephane-brochu/product-ui/blob/main/docs/architecture.md">
                  Architecture
                </a>
              </p>
            </section>
            <section id="releases">
              <h2>v0.7.0</h2>
              <p>
                New: optional CreatableSelect adds creation inside a selection
                popup, with native form validation and failure/retry. No new npm
                dependency.
              </p>
              <p>
                <a href={`${base}/creatable-select.json`}>
                  creatable-select.json ↗
                </a>
              </p>
              <p>
                <a href="https://github.com/stephane-brochu/product-ui/releases/tag/v0.6.0">
                  v0.6.0 remains available unchanged.
                </a>
              </p>
              <p>
                <a href="https://github.com/stephane-brochu/product-ui/releases/tag/v0.5.0">
                  v0.5.0 remains available unchanged.
                </a>
              </p>
              <p>
                <a href="https://github.com/stephane-brochu/product-ui/releases/tag/v0.4.0">
                  v0.4.0 remains available unchanged.
                </a>
              </p>
              <p>
                <a href="https://github.com/stephane-brochu/product-ui/releases/tag/v0.3.0">
                  v0.3.0 remains available unchanged.
                </a>
              </p>
              <p>
                <a href="https://github.com/stephane-brochu/product-ui/releases/tag/v0.2.0">
                  v0.2.0 is also retained unchanged.
                </a>
              </p>
              <p>
                <a href="https://github.com/stephane-brochu/product-ui/releases/tag/v0.1.0">
                  v0.1.0 remains available unchanged.
                </a>
              </p>
              <p>
                Milestone 5 adds independent optional chart and PDF renderers.
                Product-owned navigation and form/review workflows remain
                available. The library also includes everyday selection
                controls, disclosure, settings and metadata. The expanded core
                also includes layout, feedback, Checkbox and Textarea.
                Dialog/Drawer are optional, with a declared Radix dependency and
                theme-aware portals.
              </p>
              <div className="registry-links">
                {[
                  "chart-primitives",
                  "time-series-plot",
                  "comparison-plots",
                  "pdf-viewer",
                  "pdfjs-loader",
                  "navigation",
                  "mobile-navigation",
                  "form-feedback",
                  "confirmation-dialog",
                  "repeatable-fields",
                  "file-selection",
                  "upload-queue",
                  "review-layout",
                  "table",
                  "metrics",
                  "data-navigation",
                  "source-reference",
                  "data-table",
                  "selection",
                  "disclosure",
                  "controlled-disclosure",
                  "settings",
                  "popover",
                  "action-menu",
                  "page-layout",
                  "feedback",
                  "checkbox",
                  "theme-boundary",
                  "dialog",
                  "theme",
                  "controls",
                  "patterns",
                  "button",
                  "fields",
                  "filter-bar",
                  "form-section",
                  "core",
                ].map((item) => (
                  <a key={item} href={`${base}/${item}.json`}>
                    {item}.json ↗
                  </a>
                ))}
              </div>
              <p>
                <a href={`${base}/manifest.json`}>
                  Release manifest & file hashes
                </a>{" "}
                ·{" "}
                <a href="https://github.com/stephane-brochu/product-ui/releases/tag/v0.7.0">
                  Release notes
                </a>
              </p>
              <p className="note">
                Registry installs create source copies. Upgrades are deliberate:
                compare the pinned hashes, review any local changes, then
                install a reviewed release. v0.6 supports React 19; the starter
                and CSS paths use a src directory.
              </p>
            </section>
            <footer>
              Product UI / v0.7.0 <span>React · owned source · MIT</span>
            </footer>
          </main>
        </div>
      </div>
    </ThemeBoundary>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
