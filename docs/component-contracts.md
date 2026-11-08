# Component contracts — v0.4.0

The live catalogue imports the canonical sources and exposes both Ledger and Studio themes. React 19 is required. The library owns presentation and interaction; consumers own data, requests, routing and business rules.

| Family | API and behavior | Reviewable states |
| --- | --- | --- |
| PageContainer | Native div props, wide, className; semantic content width and gutters | Narrow/wide, wrapped content |
| PageHeader / SectionHeader | title, description, action, eyebrow/number, headingLevel; native header attributes. SectionHeader id belongs to heading | Long titles, mobile stacked actions, document hierarchy |
| StatusBadge | children, tone neutral/info/success/warning/danger, native span props | Text plus non-color status mark; explicit tones |
| InlineAlert | title, children, action, tone; note by default, alert for danger/error | Information, success, warning, failure |
| EmptyState / ErrorState | title, children, action, headingLevel; ErrorState onRetry | Empty, failure, recovery action |
| Loading / Progress | LoadingIndicator label; ProgressIndicator label, optional value, max | Live status, clamped determinate value, unknown progress |
| Checkbox | Native input props/ref; label, description, error, indeterminate, fieldClassName | Unchecked, checked, mixed, disabled, error, linked help |
| Textarea | Native textarea attributes; label, description, error, fieldClassName | Editable, required, read-only, disabled, error |
| ThemeBoundary | theme, native div props, children; nested portal host | Ledger/Studio, nested boundaries, reactive theme changes |
| Dialog / Drawer | title, description, trigger, open/defaultOpen/onOpenChange, dismissible, size, closeLabel, contentProps, onCloseAutoFocus | Open/closed, pending dismissal lock, failure retention, success, focus trap and return |

Import ui-theme.css, ui-controls.css and ui-patterns.css for the original core. Add ui-layout.css and ui-feedback.css for expanded core; ui-dialog.css for overlays. Theme tokens cover content width, gutters, overlay colors/layers, dialog radius and feedback colors. No app-wide reset or remote fonts are required.

Dialog/Drawer use Radix modal semantics. A trigger should be a single ref-capable element (Button supports React 19 refs). Without a trigger, the product must provide deliberate focus restoration via onCloseAutoFocus. Title/description should contain meaningful text. Content props permit advanced focus handling; callers must preserve accessibility. The boundary's portal host inherits tokens; CSS transforms/containment on ancestor wrappers can affect fixed positioning and should be avoided.

Native form/browser validation remains available. Error messages do not automatically move focus or manage a form-wide validation summary. ValidationMessage announces validation, ToastNotification announces status; queue management is not included. Dates and checkboxes retain browser-specific native behavior.

Automated checks cover native relationships and serialization, refs, heading order, retry, bounded/unknown progress, focus trap/return, controlled and uncontrolled overlays, busy close prevention, failed-save value retention, registry dependency policy, optional installation and v0.1 integrity protections. Browser review covers both themes and desktop/phone layouts. This is not a formal assistive-technology certification.


## Everyday controls

| Item | Exports | Supported states |
| --- | --- | --- |
| selection | RadioGroup, SegmentedControl, Switch | Controlled/uncontrolled, default values, native reset/serialization, required radios, disabled, validation, empty/removed choices |
| disclosure | Disclosure (server-compatible) | Native expansion before hydration, initial open/closed, count, nested content |
| controlled-disclosure | ControlledDisclosure (client) | Validation reveal, owner-controlled open, keyboard activation, focus recovery |
| settings | SettingsGroup, SettingsRow, MetadataList | Heading levels, labelled sections, responsive control slots, missing versus zero, long values |
| popover (optional) | Popover, PopoverClose | Default/controlled open, slotted content/close, collision, theme scope and focus return |
| action-menu (optional) | DropdownActionMenu | Keyboard selection, stable IDs, disabled/empty/destructive presentation, prevent-dismiss selection, focus return |

See [v0.3 migration and full contracts](migrations/v0.3.0.md) for native semantics, exact dependencies, CSS imports, refs, consumer changes and limits. Native controls retain browser-specific appearance and interaction. Core does not include optional Radix packages. Tests cover form reset and exact serialization, selection keyboard behavior, disclosure SSR/focus, missing-versus-zero metadata and themed nested floating surfaces.


## Data presentation

| Item | Exports | Contracts |
| --- | --- | --- |
| table | Table, TableHead/Body/Row, TableHeaderCell/Cell, NumericCell, EmptyRow, TableScrollRegion | Native/server-compatible, refs, caption/scope, named keyboard scroll, density, sticky and print |
| metrics | Metric, MetricGroup, DeltaValue | Supplied formatted values, zero versus missing, explicit direction/tone, status/comparison slots, responsive/print |
| data-navigation | TableToolbar, ResultCount, Pagination, ExportActions | Local callbacks or server links, explicit counts and selection scope, pending/disabled/error actions |
| source-reference | SourceReference | Supplied destination/content, native ref/attributes, long text, new-tab cue |
| data-table (optional client item) | DataTable, ManagementTable, compareTableValues | Exact decimal ordering, filter/search, controlled/internal state, page selection, detail rows, replacement/empty/error/loading, callback-only export |

See [v0.4.0 migration and complete contracts](migrations/v0.4.0.md), including client boundaries, null ordering, row identity, state reconciliation, print/export scope, comparator and dataset limits. Earlier everyday-control contracts remain in the v0.3 migration.
