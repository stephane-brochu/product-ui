// @vitest-environment node
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
// @ts-expect-error JavaScript tooling API
import { install, check } from "../scripts/consume.mjs";
let directory: string;
beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), "product-ui-v6-"));
});
afterEach(async () => {
  await fs.rm(directory, { recursive: true, force: true });
});
const release = path.resolve("releases/v0.6.0");
it("keeps core at 29 files without optional chart/PDF source or dependencies", async () => {
  const lock = await install({ project: directory, version: "0.6.0", release });
  expect(lock.files).toHaveLength(29);
  expect(lock.dependencies).toEqual({});
  expect(
    lock.files.some((file: { target: string }) =>
      /pdf|chart|plot/.test(file.target),
    ),
  ).toBe(false);
});
it("installs complete chart rendering independently of PDF.js", async () => {
  const lock = await install({
    project: directory,
    version: "0.6.0",
    release,
    items: "core,time-series-plot,comparison-plots",
  });
  expect(lock.files).toHaveLength(33);
  expect(lock.dependencies).toEqual({});
  expect(
    lock.files.some((file: { target: string }) => /pdf/.test(file.target)),
  ).toBe(false);
});
it("installs the generic PDF viewer with a supplied loader and no PDF.js dependency", async () => {
  const lock = await install({
    project: directory,
    version: "0.6.0",
    release,
    items: "pdf-viewer",
  });
  expect(lock.dependencies).toEqual({});
  expect(
    lock.files.some((file: { target: string }) =>
      /pdfjs-loader/.test(file.target),
    ),
  ).toBe(false);
  expect(
    lock.files.some((file: { target: string }) => /chart/.test(file.target)),
  ).toBe(false);
});
it("requires an exact PDF.js pin before installing its optional loader adapter", async () => {
  await fs.writeFile(
    path.join(directory, "package.json"),
    JSON.stringify({ dependencies: { "pdfjs-dist": "^6.4.299" } }),
  );
  await expect(
    install({
      project: directory,
      version: "0.6.0",
      release,
      items: "pdfjs-loader",
    }),
  ).rejects.toThrow(/exact dependency/);
  expect(await fs.readdir(directory)).toEqual(["package.json"]);
  await fs.writeFile(
    path.join(directory, "package.json"),
    JSON.stringify({ dependencies: { "pdfjs-dist": "6.4.299" } }),
  );
  const lock = await install({
    project: directory,
    version: "0.6.0",
    release,
    items: "pdfjs-loader",
  });
  expect(lock.dependencies).toEqual({ "pdfjs-dist": "6.4.299" });
  expect((await check(directory)).files).toHaveLength(8);
});
it("upgrades a workflow consumer without dropping earlier optional items", async () => {
  await fs.writeFile(
    path.join(directory, "package.json"),
    JSON.stringify({
      dependencies: {
        "@radix-ui/react-dialog": "1.3.1",
        "@radix-ui/react-popover": "1.3.1",
        "@radix-ui/react-dropdown-menu": "2.2.1",
        "pdfjs-dist": "6.4.299",
      },
    }),
  );
  await install({
    project: directory,
    version: "0.5.0",
    release: path.resolve("releases/v0.5.0"),
    items:
      "core,data-table,mobile-navigation,repeatable-fields,file-selection,confirmation-dialog,popover,action-menu",
  });
  const lock = await install({
    project: directory,
    version: "0.6.0",
    release,
    items: "core,time-series-plot,comparison-plots,pdfjs-loader",
  });
  expect(lock.files).toHaveLength(47);
  expect(lock.items).toContain("confirmation-dialog");
  expect(lock.items).toContain("data-table");
});
