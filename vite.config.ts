import { defineConfig } from "vite";
export default defineConfig({
  root: "docs",
  publicDir: false,
  envDir: "../.empty-env",
  envPrefix: "PRODUCT_UI_PUBLIC_",
  build: { outDir: "../dist", emptyOutDir: true, sourcemap: false },
});
