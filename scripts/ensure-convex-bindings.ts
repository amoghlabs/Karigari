/**
 * Restores `src/convex/_generated` from the committed snapshot in
 * `scripts/convex-bindings/` when it is missing.
 *
 * Why this exists: the app imports the generated Convex bindings both at build
 * time (`tsc -b` typechecks every file under `src/convex/`) and at runtime
 * (`@/convex/_generated/api` in the client). `src/convex/_generated` is
 * gitignored, and the Convex CLI can only regenerate it with deploy
 * credentials, so a build host like Vercel — which has no `.env.local` and no
 * `CONVEX_DEPLOY_KEY` — would otherwise fail with
 * "Cannot find module './_generated/server'".
 *
 * The snapshot is only ever a copy of real `convex codegen` output, and this
 * script never overwrites an existing folder, so local development is
 * untouched: `npx convex dev` keeps regenerating live bindings there.
 *
 * Usage: `bun scripts/ensure-convex-bindings.ts` (runs as part of `bun run build`).
 */
import { cpSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(projectRoot, "src/convex/_generated");
const snapshot = resolve(projectRoot, "scripts/convex-bindings");

if (existsSync(target)) {
  console.log(
    "[convex-bindings] src/convex/_generated already exists — leaving it untouched.",
  );
  process.exit(0);
}

if (!existsSync(snapshot)) {
  console.error(
    "[convex-bindings] No bindings available.\n" +
      `  Missing generated folder: ${target}\n` +
      `  Missing snapshot folder:  ${snapshot}\n` +
      "Run `npx convex dev` to generate the bindings, then refresh the snapshot with:\n" +
      "  mkdir -p scripts/convex-bindings && cp src/convex/_generated/*.js src/convex/_generated/*.d.ts scripts/convex-bindings/",
  );
  process.exit(1);
}

cpSync(snapshot, target, { recursive: true });
console.log(
  `[convex-bindings] Restored src/convex/_generated from ${snapshot}.`,
);
