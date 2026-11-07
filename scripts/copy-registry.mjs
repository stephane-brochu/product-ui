import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await fs.cp(path.join(root, "releases"), path.join(root, "dist/r"), {
  recursive: true,
});
await fs.copyFile(
  path.join(root, "LICENSE"),
  path.join(root, "dist/LICENSE.txt"),
);
