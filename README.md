# Product UI

A small owned-source React 19 component library, extracted from a working product and designed for reuse across products. MIT licensed. v0.6.0 ships buttons, native fields, filter/form patterns, semantic themes, a versioned shadcn registry, a Vite starter, page layout, feedback states, Checkbox/Textarea optional Dialog/Drawer, selection controls, disclosures, settings/metadata and optional Popover/action menus.

- Documentation: https://brochu-product-ui.vercel.app
- Registry: https://brochu-product-ui.vercel.app/r/v0.6.0/core.json
- Source: https://github.com/stephane-brochu/product-ui

## Use in an existing React product

In a shadcn-configured React 19 project:

```sh
npx shadcn@4.23.0 add https://brochu-product-ui.vercel.app/r/v0.6.0/core.json
```

Individual items include theme, controls, patterns, button, fields, filter-bar, form-section, page-layout, feedback, checkbox, selection, disclosure, controlled-disclosure and settings. Dialog, popover and action-menu are optional. Dependencies are pinned to the same version. Components respect shadcn aliases; CSS files install under src/styles. Import ui-theme.css, ui-controls.css, ui-patterns.css, ui-layout.css, ui-feedback.css and ui-composition.css, ui-data.css and ui-metrics.css once from your app entry point. The CSS uses ds-* classes; Tailwind is not required to render the components.

A registry copies source. It is not an npm runtime dependency and will not automatically update existing products. Before overwriting an existing component, review the diff and preserve intentional product changes.

For deterministic tracked copies in a src-based application, use the included consumer tool:

```sh
node scripts/consume.mjs install --project /path/to/product --version 0.6.0 --registry https://brochu-product-ui.vercel.app/r/v0.6.0
node scripts/consume.mjs check --project /path/to/product
```

This writes ui-library.lock.json with the release and file hashes, detects local drift, validates downloaded contents, and refuses unmanaged overwrites. A local `--release releases/v0.6.0` can replace `--registry` for offline installs. The finance consumer uses this pinned-copy workflow.

## Start a product

Copy templates/react to a new project directory, run npm install, then npm run dev. The starter already contains the v0.6.0 source snapshot, CSS imports and its provenance lock. Change the project name, navigation and theme. Do not copy finance routes, account models or authentication into the library.

## Work on the library

Use Node 24:

```sh
npm ci
npm run dev
npm run check
```

Source lives in src; the documentation catalogue in docs imports those exact files. No product environment files or private fixtures are loaded. Read CONTRIBUTING.md and docs/architecture.md before extending the APIs.

## Release

1. Change source, tests and examples; review API compatibility.
2. Bump package.json and registry.config.json together and add migration notes.
3. Run npm run registry:build to create a new immutable releases/vX.Y.Z snapshot.
4. Run npm run check, inspect the documentation at desktop/mobile widths, and check a clean starter install.
5. Commit, tag vX.Y.Z, publish a GitHub release and deploy the checked docs/static registry.
6. Consumers review the source diff, resolve local drift, install the exact version, and run their own regressions.

Never edit a published snapshot in place. Registry URLs reference fixed versions; there is intentionally no latest alias. v0.6.0 is a release supporting React 19 and the documented src-based starter, not a universal framework adapter.

## v0.6 contracts and migration

See [component contracts](docs/component-contracts.md) and [migration notes](docs/migrations/v0.6.0.md). Core installs 29 portable files without Radix. Dialog is optional and adds three files:

```sh
npm install --save-exact @radix-ui/react-dialog@1.3.1
node scripts/consume.mjs install --project /path/to/product --version 0.6.0 --registry https://brochu-product-ui.vercel.app/r/v0.6.0 --items core,dialog
```

The deterministic installer requires the exact declared dependency before writing files, resolves transitive registry dependencies, retains previously selected items, and tracks the selected file hashes. It never invokes npm or executes downloaded code. Use the current consumer script when upgrading from v0.1.0. Import ui-layout.css, ui-feedback.css and ui-composition.css alongside the existing core CSS, and ui-dialog.css when opting into overlays. Wrap the product in ThemeBoundary for theme-aware portals.

Milestone 1 adds [everyday-control contracts and migration](docs/migrations/v0.6.0.md). Optional floating controls also import ui-floating.css and declare their pinned Radix dependencies. Earlier v0.1.0 and v0.2.0 releases remain available.

Milestone 2 standardizes [data presentation](docs/migrations/v0.6.0.md). Native tables/metrics ship in core; data-table is optional with no extra npm dependencies. Products own exact display formatting, calculations, CSV serialization and source access.

Milestones 3 and 4 add [application navigation and form/review workflows](docs/migrations/v0.6.0.md): AppShell/header/sidebar/breadcrumbs/section navigation, optional mobile navigation and confirmation, repeatable fields/file selection, callback-only upload queues and source-first review/history. The catalogue uses both Harbour workspace and Atlas support navigation. Products own branding, routes, auth, server mutations, transport, validation, retries and provenance. Import ui-navigation.css and ui-workflows.css.

Milestone 5 adds [optional chart/PDF renderer contracts](docs/migrations/v0.6.0.md). Charts require no new dependency; core remains 29 files without charts or PDF.js. The optional PDF.js adapter pins 6.4.299 and requires a product-supplied matching worker URL. Finance supplies all calculations, formatting, CSV schemas, source authorization and provenance. New products can opt into either renderer independently.
