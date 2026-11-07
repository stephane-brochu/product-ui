# Product UI

A small owned-source React 19 component library, extracted from a working product and designed for reuse across products. MIT licensed. v0.1.0 ships buttons, native fields, filter/form patterns, semantic themes, a versioned shadcn registry, and a Vite starter.

- Documentation: https://brochu-product-ui.vercel.app
- Registry: https://brochu-product-ui.vercel.app/r/v0.1.0/core.json
- Source: https://github.com/stephane-brochu/product-ui

## Use in an existing React product

In a shadcn-configured React 19 project:

```sh
npx shadcn@4.23.0 add https://brochu-product-ui.vercel.app/r/v0.1.0/core.json
```

Individual items: theme, controls, patterns, button, fields, filter-bar, form-section. Dependencies are pinned to the same version. Components respect shadcn aliases; CSS files install under src/styles. Import ui-theme.css, ui-controls.css, and ui-patterns.css once from your app entry point. The CSS uses ds-* classes; Tailwind is not required to render the components.

A registry copies source. It is not an npm runtime dependency and will not automatically update existing products. Before overwriting an existing component, review the diff and preserve intentional product changes.

For deterministic tracked copies in a src-based application, use the included consumer tool:

```sh
node scripts/consume.mjs install --project /path/to/product --version 0.1.0 --registry https://brochu-product-ui.vercel.app/r/v0.1.0
node scripts/consume.mjs check --project /path/to/product
```

This writes ui-library.lock.json with the release and file hashes, detects local drift, validates downloaded contents, and refuses unmanaged overwrites. A local `--release releases/v0.1.0` can replace `--registry` for offline installs. The finance consumer uses this pinned-copy workflow.

## Start a product

Copy templates/react to a new project directory, run npm install, then npm run dev. The starter already contains the v0.1.0 source snapshot, CSS imports and its provenance lock. Change the project name, navigation and theme. Do not copy finance routes, account models or authentication into the library.

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

Never edit a published snapshot in place. Registry URLs reference fixed versions; there is intentionally no latest alias. v0.1.0 is a first release supporting React 19 and the documented src-based starter, not a universal framework adapter.
