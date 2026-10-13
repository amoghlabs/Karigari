#!/usr/bin/env node
/**
 * Fails the build when the emitted JS chunks import one another cyclically.
 *
 * Why this exists: a circular chunk graph is invisible until production. Rollup
 * will happily emit `react-vendor` importing `convex-vendor` importing
 * `react-vendor`, and ESM evaluates that by running one chunk's body while the
 * other is still paused at its own import — so `var` initializers in the paused
 * chunk have not run yet. Any lazy CommonJS init that touches them throws
 * `Cannot set properties of undefined (...)`, which is a blank page and nothing
 * else in the console. That is exactly how https://karigari.freebuff.app/ went
 * down, and `manualChunks` is the only thing that can cause it here.
 *
 * Only *static* imports (`from "./x.js"` / `import "./x.js"`) are considered.
 * Dynamic `import("./x.js")` runs after startup, so a cycle there is a caching
 * concern rather than a crash.
 *
 * Usage:
 *   node src/deploy/check-chunk-cycles.mjs                # checks dist/assets
 *   node src/deploy/check-chunk-cycles.mjs --dir <dir>    # checks a fixture
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

const argv = process.argv.slice(2);
const dirFlag = argv.indexOf("--dir");

if (dirFlag !== -1 && !argv[dirFlag + 1]) {
  console.error("[chunk-cycles] --dir requires a path.");
  process.exit(1);
}

const outDir =
  dirFlag === -1
    ? join(projectRoot, "dist", "assets")
    : resolve(projectRoot, argv[dirFlag + 1]);

if (!existsSync(outDir)) {
  console.error(
    `[chunk-cycles] No output directory at ${outDir}.\n` +
      "Run the build first (the chunks are written to dist/assets).",
  );
  process.exit(1);
}

/** Static relative imports only; dynamic imports are excluded on purpose. */
const STATIC_IMPORT = /(?:from|import)\s*["'](\.{1,2}\/[^"']+)["']/g;

const files = readdirSync(outDir).filter((f) => /\.(js|mjs)$/.test(f));
const known = new Set(files);

const graph = new Map();
let edges = 0;

for (const file of files) {
  const source = readFileSync(join(outDir, file), "utf8");
  const deps = new Set();
  let match;
  STATIC_IMPORT.lastIndex = 0;
  while ((match = STATIC_IMPORT.exec(source))) {
    const target = match[1].replace(/^\.\//, "");
    if (known.has(target) && target !== file) deps.add(target);
  }
  graph.set(file, [...deps]);
  edges += deps.size;
}

/** Depth-first search returning every distinct cycle as a path of chunk names. */
function findCycles() {
  const state = new Map();
  const stack = [];
  const cycles = [];

  function visit(node) {
    state.set(node, 1);
    stack.push(node);
    for (const next of graph.get(node) ?? []) {
      if (state.get(next) === 1) {
        cycles.push(stack.slice(stack.indexOf(next)).concat(next));
      } else if (!state.has(next)) {
        visit(next);
      }
    }
    stack.pop();
    state.set(node, 2);
  }

  for (const file of files) if (!state.has(file)) visit(file);
  return cycles;
}

const cycles = findCycles();

if (cycles.length > 0) {
  console.error(
    `[chunk-cycles] ${cycles.length} circular chunk import(s) in ${outDir}:\n` +
      cycles.map((c) => `  ${c.join(" -> ")}`).join("\n") +
      "\n\nCircular chunks re-enter each other's module body before its `var`\n" +
      "initializers run, which throws a TypeError at startup and renders a blank\n" +
      "page. Merge each cycle's chunks into one chunk in vite.config.ts.",
  );
  process.exit(1);
}

console.log(
  `[chunk-cycles] OK — ${files.length} chunks, ${edges} static edges, no cycles.`,
);
