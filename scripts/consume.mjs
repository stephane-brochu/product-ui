import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
const hash = (text) =>
  createHash("sha256").update(text.replace(/\r\n/g, "\n")).digest("hex");
const allowed =
  /^src\/(?:components\/(?:[a-z][a-z0-9-]*\/)?(?:ui|patterns)\/[a-z0-9-]+\.tsx|styles\/ui-[a-z0-9-]+\.css)$/;
async function readOptional(file) {
  try {
    return await fs.readFile(file, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}
function safeTarget(root, target) {
  if (!allowed.test(target))
    throw new Error(`Unapproved library target: ${target}`);
  const result = path.resolve(root, target);
  if (path.relative(root, result).startsWith(".."))
    throw new Error("Target escapes project");
  return result;
}
async function guardAncestors(root, target) {
  const realRoot = await fs.realpath(root);
  let ancestor = target;
  while (true) {
    try {
      const real = await fs.realpath(ancestor);
      const relative = path.relative(realRoot, real);
      if (relative.startsWith("..") || path.isAbsolute(relative))
        throw new Error("Target resolves outside project");
      return;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      ancestor = path.dirname(ancestor);
    }
  }
}
export async function check(project) {
  const root = path.resolve(project);
  const lock = JSON.parse(
    await fs.readFile(path.join(root, "ui-library.lock.json"), "utf8"),
  );
  if (Object.keys(lock.dependencies ?? {}).length) {
    const pkg = JSON.parse(
      await fs.readFile(path.join(root, "package.json"), "utf8"),
    );
    for (const [name, version] of Object.entries(lock.dependencies))
      if ((pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]) !== version)
        throw new Error(`Local dependency drift: ${name}; expected ${version}`);
  }
  for (const file of lock.files) {
    const target = safeTarget(root, file.target);
    await guardAncestors(root, target);
    const actual = await readOptional(target);
    if (actual === null || hash(actual) !== file.sha256)
      throw new Error(
        `Local library drift: ${file.target}. Review the local diff before updating.`,
      );
  }
  return lock;
}
export async function install({ project, release, registry, version, items, namespace }) {
  if (!version || !/^\d+\.\d+\.\d+$/.test(version))
    throw new Error("An exact release version is required");
  if (Boolean(release) === Boolean(registry))
    throw new Error("Choose exactly one local release or HTTPS registry");
  const root = path.resolve(project);
  await fs.mkdir(root, { recursive: true });
  const base = registry ? new URL(`${registry.replace(/\/$/, "")}/`) : null;
  if (base && base.protocol !== "https:")
    throw new Error("Registry must use HTTPS");
  const load = async (name) => {
    if (!/^[a-z0-9-]+\.json$/.test(name))
      throw new Error("Invalid registry filename");
    if (!base)
      return JSON.parse(
        await fs.readFile(path.join(path.resolve(release), name), "utf8"),
      );
    const response = await fetch(new URL(name, base), { redirect: "error" });
    if (!response.ok)
      throw new Error(`Registry request failed (${response.status})`);
    return response.json();
  };
  const manifest = await load("manifest.json");
  if (manifest.version !== version || manifest.name !== "product-ui")
    throw new Error("Release identity mismatch");
  if (
    !Array.isArray(manifest.files) ||
    !manifest.files.length ||
    !Array.isArray(manifest.items)
  )
    throw new Error("Invalid manifest");
  const lockPath = path.join(root, "ui-library.lock.json");
  const priorText = await readOptional(lockPath);
  if (priorText) await check(root);
  const priorLock = priorText ? JSON.parse(priorText) : null;
  namespace ??= priorLock?.namespace;
  if (namespace !== undefined && !/^[a-z][a-z0-9-]*$/.test(namespace))
    throw new Error("Namespace must be a single lowercase directory name");
  if (priorLock && (priorLock.namespace ?? "") !== (namespace ?? ""))
    throw new Error("Cannot change namespace of an existing installation");
  const destination = target => namespace && target.startsWith("src/components/")
    ? target.replace("src/components/", `src/components/${namespace}/`) : target;
  const selected = new Set();
  function visit(name) {
    if (selected.has(name)) return;
    const item = manifest.items.find((i) => i.name === name);
    if (!item) throw new Error(`Unknown registry item: ${name}`);
    selected.add(name);
    for (const dep of item.dependencies ?? []) visit(dep);
  }
  for (const name of [
    ...(typeof items === "string"
      ? items.split(",")
      : (items ?? manifest.defaultItems ?? manifest.items.map((i) => i.name))),
    ...(priorLock?.items ?? []),
  ])
    visit(name);
  const dependencies = Object.assign(
    {},
    ...manifest.items
      .filter((i) => selected.has(i.name))
      .map((i) => i.npmDependencies ?? {}),
  );
  if (Object.keys(dependencies).length) {
    const pkg = JSON.parse(
      await fs.readFile(path.join(root, "package.json"), "utf8"),
    );
    for (const [name, version] of Object.entries(dependencies))
      if ((pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]) !== version)
        throw new Error(
          `Declare exact dependency ${name}@${version} before installing overlays`,
        );
  }
  const expected = new Map();
  const seenTargets = new Set();
  for (const file of manifest.files) {
    safeTarget(root, file.target);
    if (!/^[a-f0-9]{64}$/.test(file.sha256) || seenTargets.has(file.target))
      throw new Error("Invalid or duplicate file manifest");
    seenTargets.add(file.target);
    if (selected.has(file.item)) expected.set(file.target, file);
  }
  const contents = new Map();
  for (const item of manifest.items.filter((item) => selected.has(item.name))) {
    const payload = await load(`${item.name}.json`);
    if (
      payload.name !== item.name ||
      payload.meta?.version !== version ||
      payload.meta?.repository !== manifest.repository
    )
      throw new Error("Registry item identity mismatch");
    for (const file of payload.files ?? []) {
      const match = [...expected.values()].find(
        (candidate) => candidate.source === file.path,
      );
      if (
        !match ||
        typeof file.content !== "string" ||
        hash(file.content) !== match.sha256
      )
        throw new Error(`Registry integrity failure: ${file.path}`);
      if (contents.has(match.target))
        throw new Error("Duplicate registry content");
      contents.set(destination(match.target), file.content);
    }
  }
  if (contents.size !== expected.size)
    throw new Error("Incomplete registry release");
  const previouslyManaged = new Set(
    priorText ? JSON.parse(priorText).files.map((file) => file.target) : [],
  );
  // Preflight every destination before writing any file.
  for (const [target, content] of contents) {
    const dest = safeTarget(root, target);
    await guardAncestors(root, dest);
    const prior = await readOptional(dest);
    if (
      prior !== null &&
      !previouslyManaged.has(target) &&
      hash(prior) !== hash(content)
    )
      throw new Error(`Unmanaged file would be overwritten: ${target}`);
  }
  for (const [target, content] of contents) {
    const dest = safeTarget(root, target);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, content);
  }
  const lock = {
    schemaVersion: 2,
    items: [...selected],
    dependencies,
    name: "product-ui",
    version,
    ...(namespace ? { namespace } : {}),
    repository: manifest.repository,
    registry: manifest.registry,
    files: [...expected.values()].map(({ target, sha256 }) => ({
      target: destination(target),
      sha256,
    })),
  };
  await fs.writeFile(lockPath, JSON.stringify(lock, null, 2) + "\n");
  return lock;
}
export async function main(args = process.argv.slice(2)) {
  const [command, ...rest] = args;
  const options = {};
  for (let i = 0; i < rest.length; i += 2) {
    if (!rest[i].startsWith("--") || !rest[i + 1])
      throw new Error("Expected --option value");
    options[rest[i].slice(2)] = rest[i + 1];
  }
  const project = options.project ?? process.cwd();
  const lock =
    command === "check"
      ? await check(project)
      : command === "install"
        ? await install({ ...options, project })
        : null;
  if (!lock)
    throw new Error(
      "Use check or install --version X.Y.Z --release DIR|--registry HTTPS_URL [--project DIR]",
    );
  console.log(
    `Product UI ${lock.version}: ${lock.files.length} pinned files verified${command === "install" ? " and installed" : ""}.`,
  );
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
