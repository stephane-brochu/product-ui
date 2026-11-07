# Changelog

## 0.1.0 — 2026-11-07

Initial extraction of reusable controls, fields, filter/form patterns and two semantic themes. Eight registry items, immutable versioned payloads, React 19 starter, interactive documentation, behavioural tests, and an integrity-checking consumer tool.

Migration from the finance pilot: import paths remain unchanged in the src-based consumer. Legacy global .button aliases are no longer exported; use Button or buttonClassName, or retain any required legacy styles in the product. The local finance registry is retired in favour of this release. Financial components and data services remain in finance.
