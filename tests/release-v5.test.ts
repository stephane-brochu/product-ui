// @vitest-environment node
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
// @ts-expect-error JavaScript tooling API
import { install, check } from "../scripts/consume.mjs";
let directory: string;
beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), "product-ui-v5-"));
});
afterEach(async () => {
  await fs.rm(directory, { recursive: true, force: true });
});
const release = path.resolve("releases/v0.5.0");
it("upgrades an existing data-table consumer and retains optional items with new workflow selection", async () => {
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
    version: "0.4.0",
    release: path.resolve("releases/v0.4.0"),
    items: "core,data-table,popover,action-menu,dialog",
  });
  await install({
    project: directory,
    version: "0.5.0",
    release,
    items:
      "core,mobile-navigation,repeatable-fields,file-selection,confirmation-dialog",
  });
  const lock = await check(directory);
  expect(lock.files).toHaveLength(40);
  expect(lock.items).toContain("data-table");
  expect(lock.items).toContain("confirmation-dialog");
});
it("keeps structural navigation/review in core without forcing optional client workflows or Radix", async () => {
  const lock = await install({ project: directory, version: "0.5.0", release });
  expect(lock.files).toHaveLength(29);
  expect(lock.dependencies).toEqual({});
  expect(
    lock.files.some((file: { target: string }) =>
      file.target.endsWith("confirmation-dialog.tsx"),
    ),
  ).toBe(false);
});
