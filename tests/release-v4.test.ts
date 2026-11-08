// @vitest-environment node
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
// @ts-expect-error JavaScript tooling API
import { install, check } from "../scripts/consume.mjs";
let directory: string;
beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), "product-ui-v4-"));
});
afterEach(async () => {
  await fs.rm(directory, { recursive: true, force: true });
});
const release = path.resolve("releases/v0.4.0");
it("upgrades a v0.3 consumer while retaining optional overlays and adding the interactive table", async () => {
  await fs.writeFile(
    path.join(directory, "package.json"),
    JSON.stringify({
      dependencies: {
        "@radix-ui/react-dialog": "1.3.1",
        "@radix-ui/react-popover": "1.3.1",
        "@radix-ui/react-dropdown-menu": "2.2.1",
      },
    }),
  );
  await install({
    project: directory,
    version: "0.3.0",
    release: path.resolve("releases/v0.3.0"),
    items: "core,dialog,popover,action-menu",
  });
  await install({
    project: directory,
    version: "0.4.0",
    release,
    items: "core,data-table",
  });
  const lock = await check(directory);
  expect(lock.files).toHaveLength(30);
  expect(lock.items).toContain("dialog");
  expect(lock.items).toContain("data-table");
});
it("installs native data presentation in core without pulling in client tables or Radix", async () => {
  const lock = await install({ project: directory, version: "0.4.0", release });
  expect(lock.files).toHaveLength(23);
  expect(lock.dependencies).toEqual({});
  expect(
    lock.files.some((f: { target: string }) =>
      f.target.endsWith("/data-table.tsx"),
    ),
  ).toBe(false);
});
