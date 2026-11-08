// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
// @ts-expect-error JavaScript tooling API
import { install, check } from "../scripts/consume.mjs";
// @ts-expect-error JavaScript tooling API
import { validateImports } from "../scripts/registry-policy.mjs";
let directory: string;
beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), "product-ui-v2-"));
});
afterEach(async () => {
  await fs.rm(directory, { recursive: true, force: true });
});
const release = path.resolve("releases/v0.2.0");
it("installs core without Radix, adds optional dialog with exact dependencies, and retains core", async () => {
  await install({ project: directory, release, version: "0.2.0" });
  const core = await check(directory);
  expect(
    core.files.some((f: { target: string }) =>
      f.target.endsWith("/dialog.tsx"),
    ),
  ).toBe(false);
  await fs.writeFile(
    path.join(directory, "package.json"),
    JSON.stringify({ dependencies: { "@radix-ui/react-dialog": "1.3.1" } }),
  );
  await install({
    project: directory,
    release,
    version: "0.2.0",
    items: ["dialog"],
  });
  const all = await check(directory);
  expect(all.files).toHaveLength(15);
  expect(all.dependencies).toEqual({ "@radix-ui/react-dialog": "1.3.1" });
});
it("rejects missing overlay dependency before writing any managed file", async () => {
  await fs.writeFile(path.join(directory, "package.json"), "{}");
  await expect(
    install({ project: directory, release, version: "0.2.0", items: "dialog" }),
  ).rejects.toThrow("Declare exact dependency");
  expect(await fs.readdir(directory)).toEqual(["package.json"]);
});
it("rejects undeclared external and internal imports in portable code", () => {
  const item = {
      name: "one",
      files: [{ source: "src/components/ui/one.tsx" }],
    },
    config = { items: [item] };
  expect(() =>
    validateImports(
      config,
      {},
      item,
      "src/components/ui/one.tsx",
      'import x from "next/navigation"',
    ),
  ).toThrow("Undeclared external");
  expect(() =>
    validateImports(
      config,
      {},
      item,
      "src/components/ui/one.tsx",
      'import x from "./other"',
    ),
  ).toThrow("Undeclared internal");
  expect(() =>
    validateImports(
      config,
      {},
      item,
      "src/components/ui/one.tsx",
      'const x = import("secret")',
    ),
  ).toThrow("Dynamic dependency");
});
it('detects dependency drift after an optional install',async()=>{
 await fs.writeFile(path.join(directory,'package.json'),JSON.stringify({dependencies:{'@radix-ui/react-dialog':'1.3.1'}}));
 await install({project:directory,release,version:'0.2.0',items:'dialog'});
 await fs.writeFile(path.join(directory,'package.json'),JSON.stringify({dependencies:{'@radix-ui/react-dialog':'^1.3.1'}}));
 await expect(check(directory)).rejects.toThrow('Local dependency drift');
});
