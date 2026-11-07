import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  root,
  resolve: { alias: { "@": path.join(root, "src") } },
  build: { outDir: path.join(root, "dist") },
});
