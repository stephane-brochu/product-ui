# Changelog

## 0.3.0 — 2026-11-07

Completes Milestone 1: RadioGroup/Switch/SegmentedControl, native and controlled Disclosure, SettingsGroup/SettingsRow/MetadataList, optional Popover and DropdownActionMenu. Core has 17 portable files without Radix; selecting all overlay items installs 23. Interactive examples, native form/reset/keyboard coverage, responsive styles and finance adoption accompany the source. SegmentedControl now has native single-choice radio semantics; see docs/migrations/v0.3.0.md. Historical release snapshots remain immutable.

## 0.2.0 — 2026-11-07

First extraction slice: page layout, feedback/status, Checkbox/Textarea and optional Dialog/Drawer with ThemeBoundary. Expanded core has 12 files; core plus dialog has 15. Declared import/dependency validation and selected-item installation support optional controls. See docs/migrations/v0.2.0.md.

## 0.1.0 — 2026-11-07

Initial extraction of reusable controls, fields, filter/form patterns and two semantic themes. Eight registry items, immutable versioned payloads, React 19 starter, interactive documentation, behavioural tests, and an integrity-checking consumer tool.

Migration from the finance pilot: import paths remain unchanged in the src-based consumer. Legacy global .button aliases are no longer exported; use Button or buttonClassName, or retain any required legacy styles in the product. The local finance registry is retired in favour of this release. Financial components and data services remain in finance.
