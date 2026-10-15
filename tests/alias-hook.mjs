import { existsSync, readFileSync, statSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function aliasFile(specifier) {
  if (!specifier.startsWith("@/")) return null;
  const base = path.join(root, specifier.slice(2));
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.mjs`,
    `${base}.json`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];
  return (
    candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ||
    null
  );
}

export async function resolve(specifier, context, nextResolve) {
  const hit = aliasFile(specifier);
  if (!hit) return nextResolve(specifier, context);
  return {
    shortCircuit: true,
    url: pathToFileURL(hit).href,
  };
}

function withExtension(spec, parentUrl) {
  if (!spec.startsWith(".")) return spec;
  if (/\.(tsx?|jsx?|mjs|cjs|json)$/.test(spec)) return spec;
  const parent = path.dirname(fileURLToPath(parentUrl));
  const base = path.resolve(parent, spec);
  const candidates = [
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.mjs`,
    `${base}.json`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];
  const hit = candidates.find((candidate) => existsSync(candidate));
  if (!hit) return spec;
  let rel = path.relative(parent, hit).split(path.sep).join("/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

export async function load(url, context, nextLoad) {
  if (url.startsWith("file:") && (url.endsWith(".ts") || url.endsWith(".tsx"))) {
    let source = readFileSync(new URL(url), "utf8");
    source = source.replace(
      /(from\s+|import\(\s*)(['"])(\.[^'"]+)\2/g,
      (full, prefix, quote, spec) => `${prefix}${quote}${withExtension(spec, url)}${quote}`,
    );
    source = source.replace(
      /from\s+(['"])([^'"]+\.json)\1/g,
      (full, quote, spec) =>
        full.includes("with") ? full : `from ${quote}${spec}${quote} with { type: "json" }`,
    );
    source = source.replace(
      /from\s+(['"])(next\/[^'"]+)\1/g,
      (full, quote, spec) =>
        spec.endsWith(".js") ? full : `from ${quote}${spec}.js${quote}`,
    );
    return {
      format: "module",
      shortCircuit: true,
      source: stripTypeScriptTypes(source, { mode: "strip" }),
    };
  }
  return nextLoad(url, context);
}
