# Product starter

React 19 + TypeScript + Vite, with Product UI 0.5.0 source installed and pinned.

Copy this folder into your new product, then run npm ci and npm run dev. Use Node 24. Change the name in package.json, select your theme in src/main.tsx, and compose the shared controls. Add your routing, identity and data services in the product.

Run npm run ui:check before upgrading. The lock records canonical file hashes. To adopt another version, review its release notes and run scripts/ui-library.mjs install with an exact --version and --registry URL. Resolve local changes deliberately; the installer refuses drift and unmanaged overwrites.

Components use your configured shadcn aliases. CSS imports live in src/styles.css. Do not commit secrets or product data to the library repository.

The starter uses shared AppShell/Header/Sidebar with neutral Harbour branding and native section links. Add your router/auth/data services in the product. MobileNavigation, FileSelection, RepeatableFields and ConfirmationDialog are opt-in registry items; read the v0.5 migration contracts before composing workflow behavior.
