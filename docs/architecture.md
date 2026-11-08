# Architecture and ownership

Foundations (semantic --ui-* roles and two presets) feed native controls and structural patterns. Products supply their own routing, state, data, validation messages and persistence. The library contains no Next, Clerk, Prisma, account defaults or financial calculation imports.

React 19 is the v0.2 compatibility baseline. Button and structural patterns are server-compatible. Native fields are a small explicit client entry point because they use React-generated IDs. There is no runtime barrel and no app-wide styling reset. CSS classes use the ds-* prefix; stock shadcn utility classes require a deliberate semantic token adapter. Native date/month controls vary across browsers.

## Source and distribution

- src/components and src/styles: canonical authored source.
- registry.config.json: catalogue and dependency graph.
- releases/vX.Y.Z: immutable schema-validated item payloads and SHA-256 manifest.
- docs: interactive examples importing canonical source directly.
- templates/react: an independent application shell with a pinned copy and no finance dependencies.
- scripts/consume.mjs: exact-version installation and drift checks for src-based consumers.

The shadcn CLI follows configurable component aliases; stylesheet targets use src/styles. The deterministic consumer tool uses fixed src targets and is intentionally narrower than arbitrary shadcn alias layouts. A second real product should validate broader extraction and packaging decisions. Do not introduce a published npm package until that evidence justifies a stable shared runtime.

## Finance boundary

The finance product retains formatting conventions, exact financial calculations, holdings/reconciliation views, document ingestion, auth and ownership rules. It consumes the 15 released portable files with a provenance lock. Its legacy token aliases and remaining Popover/Menu controls remain product-owned. Component changes are made here, released, and then adopted there through an explicit version update.
