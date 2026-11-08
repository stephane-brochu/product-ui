import ts from "typescript";
import path from "node:path";
export function validateImports(config, pkg, item, source, content) {
  const closure = new Set();
  function visit(name) {
    if (closure.has(name)) return;
    closure.add(name);
    for (const dep of config.items.find((i) => i.name === name)?.dependencies ??
      [])
      visit(dep);
  }
  visit(item.name);
  const available = new Set(
    config.items
      .filter((i) => closure.has(i.name))
      .flatMap((i) => i.files.map((f) => f.source)),
  );
  const npm = Object.assign(
    {},
    ...config.items
      .filter((i) => closure.has(i.name))
      .map((i) => i.npmDependencies ?? {}),
  );
  for (const [name, version] of Object.entries(npm))
    if (
      pkg.dependencies?.[name] !== version ||
      !/^\d+\.\d+\.\d+$/.test(version)
    )
      throw new Error(`Unpinned dependency: ${name}`);
  const ast = ts.createSourceFile(
    source,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  function check(spec) {
    if (spec === "react") return;
    if (spec.startsWith(".")) {
      const resolved = path.posix.normalize(
        path.posix.join(path.posix.dirname(source), spec),
      );
      if (!available.has(resolved + ".tsx"))
        throw new Error(`Undeclared internal import: ${source}: ${spec}`);
    } else if (!npm[spec])
      throw new Error(`Undeclared external import: ${source}: ${spec}`);
  }
  function walk(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier
    ) {
      if (!ts.isStringLiteral(node.moduleSpecifier))
        throw new Error("Nonliteral import");
      check(node.moduleSpecifier.text);
    }
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        node.expression.getText(ast) === "require")
    )
      throw new Error("Dynamic dependency is not portable");
    ts.forEachChild(node, walk);
  }
  walk(ast);
}
