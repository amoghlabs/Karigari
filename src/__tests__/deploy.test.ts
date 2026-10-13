/**
 * Targeted tests for the static-host build plumbing — the Convex bindings shim.
 *
 * This is the one part of the repo with no runtime anyone can click on, and it
 * has broken the Vercel build three times, always the same way: the checkout
 * arrives without `src/convex/_generated`, so `tsc -b` explodes with
 * `Cannot find module './_generated/server'` followed by ~340 cascading
 * `Parameter 'q' implicitly has an 'any' type` errors.
 *
 * The script's own path arithmetic is what makes it testable: it derives the
 * project root from its own location, so a throwaway fixture that mirrors
 * `src/deploy/` exercises the real logic without touching this repo.
 */
import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "../..");
const deployDir = join(repoRoot, "src", "deploy");
const scriptName = "restore-convex-bindings.mjs";
const snapshotDirName = "convex-bindings";

/** The five files `convex codegen` writes; the app needs all of them. */
const EXPECTED_BINDING_FILES = [
  "api.d.ts",
  "api.js",
  "dataModel.d.ts",
  "server.d.ts",
  "server.js",
];

function makeFixture(): string {
  const root = mkdtempSync(join(tmpdir(), "convex-bindings-"));
  mkdirSync(join(root, "src", "convex"), { recursive: true });
  cpSync(deployDir, join(root, "src", "deploy"), { recursive: true });
  return root;
}

function runRestore(root: string, args: string[] = []) {
  return spawnSync("node", [join(root, "src", "deploy", scriptName), ...args], {
    encoding: "utf8",
  });
}

const generatedIn = (root: string) => join(root, "src", "convex", "_generated");
const snapshotIn = (root: string) => join(root, "src", "deploy", snapshotDirName);

describe("restore-convex-bindings.mjs", () => {
  test("restores every binding file when the folder is missing", () => {
    const root = makeFixture();
    try {
      const result = runRestore(root);
      expect(result.status).toBe(0);
      expect(readdirSync(generatedIn(root)).sort()).toEqual(
        [...EXPECTED_BINDING_FILES].sort(),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("restored files are byte-identical to the snapshot", () => {
    const root = makeFixture();
    try {
      expect(runRestore(root).status).toBe(0);
      for (const file of EXPECTED_BINDING_FILES) {
        expect(readFileSync(join(generatedIn(root), file), "utf8")).toBe(
          readFileSync(join(snapshotIn(root), file), "utf8"),
        );
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("never copies its README into the bindings folder", () => {
    const root = makeFixture();
    try {
      expect(existsSync(join(snapshotIn(root), "README.md"))).toBe(true);
      expect(runRestore(root).status).toBe(0);
      expect(readdirSync(generatedIn(root))).not.toContain("README.md");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("leaves an existing folder untouched, so `npx convex dev` output wins", () => {
    const root = makeFixture();
    try {
      const target = generatedIn(root);
      mkdirSync(target, { recursive: true });
      writeFileSync(join(target, "api.js"), "// sentinel from convex dev\n");
      const result = runRestore(root);
      expect(result.status).toBe(0);
      expect(readFileSync(join(target, "api.js"), "utf8")).toBe(
        "// sentinel from convex dev\n",
      );
      expect(readdirSync(target)).toEqual(["api.js"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("exits non-zero with an actionable message when nothing is available", () => {
    const root = makeFixture();
    try {
      rmSync(snapshotIn(root), { recursive: true, force: true });
      const result = runRestore(root);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("No bindings available");
      expect(result.stderr).toContain("_generated");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("--snapshot refreshes the committed copy from freshly generated bindings", () => {
    const root = makeFixture();
    try {
      const target = generatedIn(root);
      mkdirSync(target, { recursive: true });
      writeFileSync(join(target, "api.js"), "// regenerated\n");
      const result = runRestore(root, ["--snapshot"]);
      expect(result.status).toBe(0);
      expect(readFileSync(join(snapshotIn(root), "api.js"), "utf8")).toBe(
        "// regenerated\n",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("--snapshot refuses to run when there are no generated bindings", () => {
    const root = makeFixture();
    try {
      const result = runRestore(root, ["--snapshot"]);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Cannot snapshot");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("build wiring", () => {
  const pkg = JSON.parse(
    readFileSync(join(repoRoot, "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };

  test("postinstall restores the bindings, so a bare `bun install` is enough", () => {
    expect(pkg.scripts.postinstall).toContain(`src/deploy/${scriptName}`);
  });

  test("build restores the bindings and still runs tsc and vite", () => {
    expect(pkg.scripts.build).toContain(`src/deploy/${scriptName}`);
    expect(pkg.scripts.build).toContain("tsc -b");
    expect(pkg.scripts.build).toContain("vite build");
  });

  test("a missing script cannot hard-fail the build before tsc reports the real error", () => {
    expect(pkg.scripts.build).toContain("|| true");
  });

  test("there is a documented way to refresh the snapshot", () => {
    expect(pkg.scripts["convex:bindings:snapshot"]).toContain("--snapshot");
  });

  test("no script tries to run `convex deploy`, which needs a deploy key Vercel lacks", () => {
    for (const [name, command] of Object.entries(pkg.scripts)) {
      expect(`${name}: ${command}`).not.toContain("convex deploy");
    }
  });
});

describe("static-host configuration", () => {
  test(".gitignore does not ignore the Convex bindings (the 346-error cause)", () => {
    const activeLines = readFileSync(join(repoRoot, ".gitignore"), "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"));
    for (const line of activeLines) {
      expect(line).not.toContain("_generated");
    }
  });

  test("src/deploy is excluded from the app typecheck", () => {
    const tsconfig = readFileSync(
      join(repoRoot, "tsconfig.app.json"),
      "utf8",
    );
    expect(tsconfig).toContain('"src/deploy"');
  });

  test("vercel.json builds the static app and serves the SPA", () => {
    const vercel = JSON.parse(
      readFileSync(join(repoRoot, "vercel.json"), "utf8"),
    ) as {
      buildCommand: string;
      outputDirectory: string;
      rewrites: { source: string; destination: string }[];
    };
    expect(vercel.buildCommand).toBe("bun run build");
    expect(vercel.outputDirectory).toBe("dist");
    expect(vercel.rewrites[0].destination).toBe("/index.html");
  });
});

describe("missing VITE_CONVEX_URL cannot blank the deployed site", () => {
  // `new ConvexReactClient(undefined)` throws at module scope, i.e. before
  // `createRoot` and outside `RootErrorBoundary`, so the only symptom used to be
  // a white page and one console error. A host build missing the variable is the
  // most likely production misconfiguration there is, so it gets a guard.
  const mainSource = readFileSync(join(repoRoot, "src", "main.tsx"), "utf8");

  test("the client is only constructed for a defined URL", () => {
    expect(mainSource).not.toMatch(
      /new ConvexReactClient\(\s*import\.meta\.env\.VITE_CONVEX_URL/,
    );
    expect(mainSource).toMatch(/convexUrl \?\s*new ConvexReactClient/);
  });

  test("a visible fallback replaces the app instead of a blank page", () => {
    expect(mainSource).toContain("MissingConvexUrl");
    expect(mainSource).toContain("VITE_CONVEX_URL");
  });
});

describe("committed bindings stay in sync", () => {
  const generatedDir = join(repoRoot, "src", "convex", "_generated");
  const snapshotDir = join(deployDir, snapshotDirName);

  test("src/convex/_generated is present in the repo, not just generated locally", () => {
    expect(existsSync(generatedDir)).toBe(true);
  });

  test("the committed snapshot matches the generated bindings byte for byte", () => {
    const snapshotFiles = readdirSync(snapshotDir)
      .filter((file) => file.endsWith(".js") || file.endsWith(".d.ts"))
      .sort();
    expect(snapshotFiles).toEqual([...EXPECTED_BINDING_FILES].sort());
    expect(readdirSync(generatedDir).sort()).toEqual(
      [...EXPECTED_BINDING_FILES].sort(),
    );
    for (const file of EXPECTED_BINDING_FILES) {
      expect(readFileSync(join(snapshotDir, file), "utf8")).toBe(
        readFileSync(join(generatedDir, file), "utf8"),
      );
    }
  });
});

/**
 * Circular chunk imports are invisible in dev and fatal in production: ESM runs
 * one chunk's body while the other is still paused at its own import, so `var`
 * initializers have not run and any lazy CommonJS init touching them throws.
 * That is how https://karigari.freebuff.app/ shipped a blank page with
 * "Cannot set properties of undefined (setting 'Activity')". The guard runs at
 * the end of `bun run build`; here it is exercised against fixtures, the same
 * way the bindings restore script is tested above.
 */
describe("check-chunk-cycles.mjs", () => {
  const script = join(deployDir, "check-chunk-cycles.mjs");

  function makeChunks(files: Record<string, string>): string {
    const dir = mkdtempSync(join(tmpdir(), "chunk-cycles-"));
    for (const [name, source] of Object.entries(files)) {
      writeFileSync(join(dir, name), source);
    }
    return dir;
  }

  const runIn = (dir: string) =>
    spawnSync("node", [script, "--dir", dir], { encoding: "utf8" });

  test("accepts an acyclic graph", () => {
    const dir = makeChunks({
      "entry.js": 'import"./vendor.js";import"./route.js";',
      "vendor.js": 'export const a = 1;',
      "route.js": 'import"./vendor.js";export const b = 2;',
    });
    try {
      const result = runIn(dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("no cycles");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("rejects the two-chunk cycle that blanked production", () => {
    const dir = makeChunks({
      "entry.js": 'import"./react-vendor.js";',
      "react-vendor.js": 'import{r}from"./convex-vendor.js";export{};',
      "convex-vendor.js": 'import{r}from"./react-vendor.js";export{};',
    });
    try {
      const result = runIn(dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("circular chunk import");
      expect(result.stderr).toContain("vite.config.ts");
      // Either traversal direction is a valid rendering of this cycle.
      expect(result.stderr).toMatch(
        /react-vendor\.js -> convex-vendor\.js -> react-vendor\.js|convex-vendor\.js -> react-vendor\.js -> convex-vendor\.js/,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("rejects a three-chunk cycle", () => {
    const dir = makeChunks({
      "a.js": 'import"./b.js";export{};',
      "b.js": 'import"./c.js";export{};',
      "c.js": 'import"./a.js";export{};',
    });
    try {
      const result = runIn(dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("a.js -> b.js -> c.js -> a.js");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("ignores dynamic import(), which only runs after startup", () => {
    const dir = makeChunks({
      "a.js": 'export const go = () => import("./b.js");',
      "b.js": 'export const back = () => import("./a.js");',
    });
    try {
      expect(runIn(dir).status).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("fails loudly when the output directory is missing", () => {
    const result = spawnSync("node", [script, "--dir", "no-such-dir"], {
      encoding: "utf8",
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("No output directory");
  });
});

/**
 * Regression assertions on the chunk rules themselves. The original bug was a
 * substring match: `id.includes('/react-dom/')` also matches
 * '@floating-ui/react-dom', which pulled a React *consumer* into the React
 * vendor chunk while React's CommonJS exports object sat in the Convex chunk.
 */
describe("vite.config.ts chunk rules", () => {
  const viteConfig = readFileSync(join(repoRoot, "vite.config.ts"), "utf8");

  test("package rules are anchored on node_modules/, not bare substrings", () => {
    expect(viteConfig).not.toMatch(/id\.includes\('\/react-dom\/\'\)/);
    expect(viteConfig).toContain("pkg('react-dom')");
    expect(viteConfig).toContain("/node_modules/${name}/");
  });

  test("React and Convex share one chunk so the graph cannot go circular", () => {
    expect(viteConfig).toContain("core-vendor");
    expect(viteConfig).not.toContain("convex-vendor");
    expect(viteConfig).not.toContain("'react-vendor'");
  });

  test("the cycle guard is wired into the build", () => {
    const pkg = JSON.parse(
      readFileSync(join(repoRoot, "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    expect(pkg.scripts.build).toContain("check-chunk-cycles.mjs");
    expect(pkg.scripts["chunks:check"]).toContain("check-chunk-cycles.mjs");
  });
});
