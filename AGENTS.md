# Product UI

This repository is the canonical source for Product UI, a React 19 owned-source component library.

- Read README.md and CONTRIBUTING.md before editing components.
- Keep src/components and src/styles independent of application routes, auth, database clients and domain models.
- Preserve server/client boundaries: hooks live in explicit client modules; structural patterns stay server-compatible.
- Use semantic --ui-* theme roles. Never add product-specific colour patches inside a primitive.
- Preserve native form semantics, labels, descriptions, keyboard focus and exact string values.
- Keep examples fictional and credential-free. Do not copy finance fixtures, account identifiers or private records into this repository.
- Add meaningful interaction coverage for changed behaviour and run npm run check.
- Never overwrite releases/v* snapshots. Bump package.json, add release notes and generate a new snapshot.
- Consumer source copies are versioned by release manifests and hashes; document migrations and local override handling.
- Do not publish an npm package: v0.1 uses a source registry. Tags and registry artifacts are the release unit.
