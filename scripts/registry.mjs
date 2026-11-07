import fs from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { registryItemSchema } from "shadcn/schema";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(
  await fs.readFile(path.join(root, "registry.config.json"), "utf8"),
);
const pkg = JSON.parse(
  await fs.readFile(path.join(root, "package.json"), "utf8"),
);
if (config.version !== pkg.version || !/^\d+\.\d+\.\d+$/.test(pkg.version))
  throw new Error("Release version mismatch");
const version = `v${pkg.version}`;
const output = path.join(root, "releases", version);
const payloads = new Map();
const manifestFiles = new Map();
const base = `${config.homepage}/r/${version}`;
const known = new Set(config.items.map((item) => item.name));
const visited = new Set();
const visiting = new Set();
function visit(name) {
  if (visiting.has(name)) throw new Error(`Registry dependency cycle: ${name}`);
  if (visited.has(name)) return;
  const item = config.items.find((item) => item.name === name);
  if (!item) throw new Error(`Unknown registry item: ${name}`);
  visiting.add(name);
  for (const dep of item.dependencies ?? []) visit(dep);
  visiting.delete(name);
  visited.add(name);
}
for (const item of config.items) visit(item.name);
for (const item of config.items) {
  for (const dep of item.dependencies ?? [])
    if (!known.has(dep)) throw new Error(`Unknown dependency: ${dep}`);
  const files = [];
  for (const file of item.files) {
    if (
      !/^(src\/components\/(ui|patterns)\/|src\/styles\/ui-)/.test(
        file.source,
      ) ||
      file.source.includes("..")
    )
      throw new Error("Unexpected portable source");
    const content = (
      await fs.readFile(path.join(root, file.source), "utf8")
    ).replace(/\r\n/g, "\n");
    if (file.source.endsWith(".tsx") && /from ["'](?!react["'])/.test(content))
      throw new Error(`Application dependency in ${file.source}`);
    const sha256 = createHash("sha256").update(content).digest("hex");
    manifestFiles.set(file.target, {
      source: file.source,
      target: file.target,
      sha256,
      item: item.name,
    });
    files.push({
      path: file.source,
      type: file.type,
      target: file.registryTarget,
      content,
    });
  }
  const payload = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.name,
    type: item.type,
    title: item.title,
    description: `Product UI ${version}: ${item.title}. Import the documented CSS files once.`,
    meta: { version: pkg.version, repository: config.repository },
    registryDependencies: (item.dependencies ?? []).map(
      (dep) => `${base}/${dep}.json`,
    ),
    files,
  };
  registryItemSchema.parse(payload);
  payloads.set(`${item.name}.json`, JSON.stringify(payload, null, 2) + "\n");
}
const manifest = {
  name: config.name,
  version: pkg.version,
  repository: config.repository,
  registry: base,
  items: config.items.map(({ name, dependencies = [] }) => ({
    name,
    dependencies,
  })),
  files: [...manifestFiles.values()],
};
payloads.set("manifest.json", JSON.stringify(manifest, null, 2) + "\n");
// Existing release tags are an additional immutability boundary in Git checkouts.
const tags = spawnSync("git", ["tag", "--list", "v*"], {cwd:root, encoding:"utf8"});
if(tags.status===0) for(const tag of tags.stdout.trim().split("\n").filter(tag=>/^v\d+\.\d+\.\d+$/.test(tag))) {
  const diff=spawnSync("git",["diff","--exit-code",tag,"--",`releases/${tag}`],{cwd:root,encoding:"utf8"});
  if(diff.status!==0)throw new Error(`Published snapshot differs from tag ${tag}; create a new release.`);
}
const mode = process.argv[2];
if (mode === "build") {
  try {
    await fs.access(output);
    throw new Error(
      `Release ${version} already exists; snapshots are immutable. Bump the version.`,
    );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await fs.mkdir(output, { recursive: true });
  for (const [name, content] of payloads)
    await fs.writeFile(path.join(output, name), content);
} else if (mode === "check") {
  for (const [name, content] of payloads) {
    const actual = await fs.readFile(path.join(output, name), "utf8");
    if (actual.replace(/\r\n/g, "\n") !== content)
      throw new Error(
        `Release drift: ${name}. Bump the version rather than editing a published snapshot.`,
      );
  }
} else throw new Error("Use registry.mjs build or check");
console.log(
  `${version}: ${config.items.length} registry items, ${manifest.files.length} portable files (${mode}).`,
);
