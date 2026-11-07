import { check } from "./consume.mjs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await check(path.join(root, "templates/react"));
for (const [script, args] of [
  [
    "typescript/bin/tsc",
    ["--project", "templates/react/tsconfig.json", "--noEmit"],
  ],
  ["vite/bin/vite.js", ["build", "--config", "templates/react/vite.config.ts"]],
]) {
  const result = spawnSync(
    process.execPath,
    [path.join(root, "node_modules", script), ...args],
    { cwd: root, stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
