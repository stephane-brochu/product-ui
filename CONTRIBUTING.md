# Extending Product UI

Start with a real product requirement. Decide whether it belongs in foundations, a primitive, a composition, or the consuming product. Shared modules accept content, values and callbacks; they do not import routes, business models, authentication or persistence.

## Definition of ready

- Typed API with native element attributes where relevant.
- Labelled controls and descriptions; visible focus; keyboard and touch behaviour.
- Loading, disabled, validation and empty states where applicable.
- Responsive examples in the catalogue, using fictional data only.
- Behavioural tests for important interactions; no tests that only repeat markup.
- No loss of string precision in amount or identifier fields.
- No global reset or unscoped application selectors in exported component CSS.
- Direct imports and explicit client boundaries. Do not create a global interactive barrel.

Run npm run check. Registry validation enforces React-only component imports, the shadcn schema and immutable snapshot contents. CI runs these checks and rebuilds the starter from its pinned source.

## Release discipline

Version 0.x APIs may evolve, but every change still needs a migration note. Bump both version fields and add a CHANGELOG entry. Generate a new snapshot with npm run registry:build; never overwrite an existing snapshot. Commit the snapshot and template lock together. Tag only after source, generated artifacts and docs have passed checks. Publish the tagged release, then deploy the static docs and registry. Keep old /r/vX.Y.Z paths available.

## Consumer ownership

Use the consumer lock to detect local changes before an upgrade. If a product-specific extension is useful elsewhere, propose it in this repository; if it belongs to that product's domain, keep an adapter or wrapper there. Do not silently overwrite a locally modified copy. The consumer tool does not delete retired local files automatically.
