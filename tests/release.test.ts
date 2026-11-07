// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
// @ts-expect-error Node tooling has a separately exercised JavaScript API.
import { install, check } from "../scripts/consume.mjs";
let directory: string;
beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), "product-ui-release-"));
});
afterEach(async () => {
  await fs.rm(directory, { recursive: true, force: true });
});
const release = path.resolve("releases/v0.1.0");
it("installs the complete release and detects local edits before replacing files", async () => {
  await install({ project: directory, release, version: "0.1.0" });
  expect((await check(directory)).files).toHaveLength(7);
  const target = path.join(directory, "src/components/ui/button.tsx");
  await fs.appendFile(target, "\n// consumer-specific edit\n");
  await expect(
    install({ project: directory, release, version: "0.1.0" }),
  ).rejects.toThrow("Local library drift");
  expect(await fs.readFile(target, "utf8")).toContain("consumer-specific edit");
});
it("rejects corrupted release content before creating any component", async () => {
  const corrupted = path.join(directory, "corrupted");
  await fs.cp(release, corrupted, { recursive: true });
  const button = path.join(corrupted, "button.json");
  const item = JSON.parse(await fs.readFile(button, "utf8"));
  item.files[0].content += "tampered";
  await fs.writeFile(button, JSON.stringify(item));
  const consumer = path.join(directory, "consumer");
  await expect(
    install({ project: consumer, release: corrupted, version: "0.1.0" }),
  ).rejects.toThrow("integrity failure");
  expect(await fs.readdir(consumer)).toEqual([]);
});
it("rejects traversal and preserves unrelated consumer files", async () => {
  const bad = path.join(directory, "bad");
  await fs.cp(release, bad, { recursive: true });
  const file = path.join(bad, "manifest.json");
  const manifest = JSON.parse(await fs.readFile(file, "utf8"));
  manifest.files[0].target = "../outside";
  await fs.writeFile(file, JSON.stringify(manifest));
  await expect(
    install({
      project: path.join(directory, "consumer"),
      release: bad,
      version: "0.1.0",
    }),
  ).rejects.toThrow("Unapproved library target");
  const existing = path.join(directory, "src/components/ui");
  await fs.mkdir(existing, { recursive: true });
  await fs.writeFile(path.join(existing, "button.tsx"), "local component");
  await expect(
    install({ project: directory, release, version: "0.1.0" }),
  ).rejects.toThrow("Unmanaged file would be overwritten");
  expect(await fs.readFile(path.join(existing, "button.tsx"), "utf8")).toBe(
    "local component",
  );
});
it("requires an exact version matching the requested release", async () => {
  await expect(
    install({ project: directory, release, version: "0.2.0" }),
  ).rejects.toThrow("Release identity mismatch");
});
