// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
// @ts-expect-error Tooling JavaScript API
import { install, check } from "../scripts/consume.mjs";
let directory: string;
beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), "product-ui-v3-"));
});
afterEach(async () => {
  await fs.rm(directory, { recursive: true, force: true });
});
const release = path.resolve(".registry-preview/v0.3.0");
it("upgrades a pinned v0.2 consumer, keeps its dialog selection and adds optional floating controls", async () => {
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
    release: path.resolve("releases/v0.2.0"),
    version: "0.2.0",
    items: "core,dialog",
  });
  await install({
    project: directory,
    release,
    version: "0.3.0",
    items: "core,popover,action-menu",
  });
  const lock = await check(directory);
  expect(lock.files).toHaveLength(23);
  expect(lock.items).toContain("dialog");
  expect(lock.dependencies).toEqual({
    "@radix-ui/react-dialog": "1.3.1",
    "@radix-ui/react-popover": "1.3.1",
    "@radix-ui/react-dropdown-menu": "2.2.1",
  });
});
it("keeps expanded core free of optional floating dependencies", async () => {
  const lock = await install({ project: directory, release, version: "0.3.0" });
  expect(lock.files).toHaveLength(17);
  expect(lock.dependencies).toEqual({});
  expect(
    lock.files.some((f: { target: string }) =>
      f.target.endsWith("/popover.tsx"),
    ),
  ).toBe(false);
});
it("requires declared exact floating dependencies before changing any component", async () => {
  await fs.writeFile(path.join(directory, "package.json"), "{}");
  await expect(
    install({
      project: directory,
      release,
      version: "0.3.0",
      items: "action-menu",
    }),
  ).rejects.toThrow("Declare exact dependency");
  expect(await fs.readdir(directory)).toEqual(["package.json"]);
});
