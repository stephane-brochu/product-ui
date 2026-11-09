# Changelog

## 0.7.0

- Optional CreatableSelect with callback-owned inline creation, exact native form values, validation, pending/failure/retry and nested-dialog examples.
- TextInput accepts native React19 refs. No new dependency; old snapshots retained.

## v0.6.0

- Extract optional chart primitives, time-series/grouped/signed stacked plots, comparison bars, supplied waterfall/relationship plots and sparklines with exact text alternatives.
- Add generic cancellable PDF viewer/frame and separate pinned PDF.js loader with explicit source/worker/assets/resource policy.
- Keep finance arithmetic, filters, formatters, exports, private source authorization and page anchors in product adapters.
- Core remains 29 files without chart/PDF code; all finance items 47 files. Historical releases are unchanged.

## v0.5.0

- Extract application navigation with product-supplied branding/routes/auth, native links and a mobile disclosure.
- Add form feedback, safe-focus async confirmation, stable repeatable fields, validated file selection, callback-only upload queue, review layout and history timeline.
- Add interactive neutral examples, migration contracts and interaction/consumer coverage. Preserve product mutation, authorization, retry, serialization and provenance behavior.
- Core 29 files; finance optional selection 40; no new dependencies; old release snapshots unchanged.

## 0.4.0 — 2026-11-08

Standardizes data presentation: native/server tables, Metric/DeltaValue, toolbar/count/pagination/export UI, SourceReference and optional DataTable with exact decimal ordering, controlled state and row replacement handling. Core23 files; finance30. Finance adopts16 native tables and32 metric cards while retaining formatting, calculations, CSV schemas and source access in adapters. See docs/migrations/v0.4.0.md.

## 0.3.0 — 2026-11-07

Completes Milestone 1: RadioGroup/Switch/SegmentedControl, native and controlled Disclosure, SettingsGroup/SettingsRow/MetadataList, optional Popover and DropdownActionMenu. Core has 17 portable files without Radix; selecting all overlay items installs 23. Interactive examples, native form/reset/keyboard coverage, responsive styles and finance adoption accompany the source. SegmentedControl now has native single-choice radio semantics; see docs/migrations/v0.3.0.md. Historical release snapshots remain immutable.

## 0.2.0 — 2026-11-07

First extraction slice: page layout, feedback/status, Checkbox/Textarea and optional Dialog/Drawer with ThemeBoundary. Expanded core has 12 files; core plus dialog has 15. Declared import/dependency validation and selected-item installation support optional controls. See docs/migrations/v0.2.0.md.

## 0.1.0 — 2026-11-07

Initial extraction of reusable controls, fields, filter/form patterns and two semantic themes. Eight registry items, immutable versioned payloads, React 19 starter, interactive documentation, behavioural tests, and an integrity-checking consumer tool.

Migration from the finance pilot: import paths remain unchanged in the src-based consumer. Legacy global .button aliases are no longer exported; use Button or buttonClassName, or retain any required legacy styles in the product. The local finance registry is retired in favour of this release. Financial components and data services remain in finance.
