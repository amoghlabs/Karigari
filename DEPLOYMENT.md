# Deploying कारीgari to Vercel

कारीgari is a Vite SPA backed by Convex, so a deployment has two halves that are
provisioned separately:

| Half | What it is | Where it lives |
| --- | --- | --- |
| Frontend | Static `dist/` build of the SPA | Vercel |
| Backend | Convex functions + database | Convex deployment `wonderful-cuttlefish-103` (already running) |

Vercel serves the built frontend; the frontend talks to the existing Convex
deployment over `VITE_CONVEX_URL`. **No Convex credentials are needed in Vercel**
— the build is a plain static build.

```
vercel.json
  framework        vite
  installCommand   bun install
  buildCommand     bun run build          (tsc -b && vite build)
  outputDirectory  dist
  rewrites         all routes -> /index.html   (SPA routing, applied after the
                                                filesystem check so real assets
                                                are still served directly)
```

## How the build gets the Convex bindings

The app needs `src/convex/_generated` in two places: `tsc -b` typechecks every
file under `src/convex/` (they import `./_generated/server`), and 17 components
import `@/convex/_generated/api` at runtime. The Convex CLI is what normally
writes that folder, and it needs deploy credentials — which a Vercel build
doesn't have. Without it the build dies with 300-odd errors of the form
`Cannot find module './_generated/server'` and `Parameter 'q' implicitly has an
'any' type`.

Three things keep it available, listed in the order they take effect:

1. **`src/convex/_generated` is tracked in git.** It is deliberately *not* in
   `.gitignore`, so a normal checkout already contains it.
2. A verbatim copy of the same `convex codegen` output is committed at
   `src/deploy/convex-bindings/`.
3. `src/deploy/restore-convex-bindings.mjs` copies that snapshot into
   `src/convex/_generated/` when the folder is missing. It runs on `postinstall`
   and again at the start of `bun run build`:

```
build = node src/deploy/restore-convex-bindings.mjs || true && tsc -b && vite build
```

Both the script and the snapshot live under `src/` on purpose: it is the only
path guaranteed to reach the host. The script is `.mjs` so plain `node` can run
it during `postinstall`, before any toolchain is available, and `src/deploy` is
excluded from `tsconfig.app.json` because the snapshot's `api.d.ts` uses paths
such as `../accounts.js` that only resolve from inside `src/convex/`.

The script never overwrites an existing folder, so local development is
unaffected — `npx convex dev` keeps writing live bindings straight to
`src/convex/_generated` and the script no-ops.

**Refresh the snapshot whenever you add, rename, or remove a Convex function**
(the `.d.ts` files enumerate your modules):

```bash
bun run convex:bindings:snapshot
```

---

## 1. Create the Vercel project

1. Push this repository to GitHub / GitLab.
2. Vercel dashboard → **Add New → Project** → import the repo.
3. Framework preset: **Vite**. Leave Build Command, Output Directory and Install
   Command at their defaults — `vercel.json` overrides them.

## 2. Add the environment variables Vercel needs

Project → **Settings → Environment Variables**. Add for **Production** (and
Preview if you want preview deploys to work):

| Variable | Value |
| --- | --- |
| `VITE_CONVEX_URL` | `https://wonderful-cuttlefish-103.convex.cloud` |

That is the only variable the app requires. Vite inlines `VITE_*` variables at
build time, so it must be present **before** the first build, and changing it
requires a redeploy.

Optional, and both are read only by the Freebuff error overlay
(`src/instrumentation.tsx`, currently not mounted) — safe to omit on Vercel:

| Variable | Value |
| --- | --- |
| `VITE_VLY_APP_ID` | `tasty-gifts-mate` |
| `VITE_VLY_MONITORING_URL` | `https://harmless-tapir-303.convex.site/runtime-error` |

## 3. Backend variables — already configured, no action needed

These live on the Convex deployment, not in Vercel, and are managed under
**API Keys → Backend**. They are already set correctly; do not re-create or
change them:

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | `https://wonderful-cuttlefish-103.convex.site` — used by Convex Auth for the auth HTTP routes |
| `JWKS`, `JWT_PRIVATE_KEY` | Auth token signing keys (managed, secret) |
| `VLY_CONVEX_AUTH_ISSUER`, `VLY_APP_NAME`, `VLY_INTEGRATION_*` | Freebuff/Vly platform wiring |

Optional feature keys — the app degrades gracefully without them, using
deterministic fallbacks instead:

| Variable | Enables |
| --- | --- |
| `OPENAI_API_KEY` | AI product descriptions, translations, cultural stories and pricing reasoning (`src/convex/aiStory.ts`). Without it the built-in heuristic writers are used, so **Sell with AI stays functional either way**. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Live Razorpay checkout instead of the demo checkout path. |

If sign-in ever fails to complete on the deployed origin, update `SITE_URL` to
the deployed URL (no trailing slash) under **API Keys → Backend** — that is the
one value tied to where the frontend is served from.

## 4. Deploy

Deploy from the Vercel dashboard or push to the production branch. The build runs:

1. `bun install`
2. `bun run build` → `tsc -b && vite build`
3. Vercel serves `dist/` with the SPA fallback from `vercel.json`

## 5. Verify

- `/` renders the landing page — confirms the SPA rewrite is active.
- Open `/shop`, then hard-refresh. The route must resolve rather than 404.
- Sign in via `/auth` and confirm the dashboard loads — this proves
  `VITE_CONVEX_URL` points at a live Convex deployment.
- Place a test order, then check **Track Orders** — this proves the backend
  functions are reachable from the deployed origin.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Build fails: `Cannot find module './_generated/server'` | Neither `src/convex/_generated/` nor the `src/deploy/convex-bindings/` snapshot reached the checkout. Confirm the five generated files are tracked in git and that `build` still starts with `node src/deploy/restore-convex-bindings.mjs`. |
| Build fails: `Parameter 'q' implicitly has an 'any' type` | Same cause — the bindings folder is absent, so the Convex query builders lose their generics. Fix the snapshot, not the call sites. |
| Build succeeds but the page is blank | `VITE_CONVEX_URL` was missing at build time. Add it in Vercel and redeploy (a redeploy, not just a restart, is required). |
| Console error: `Could not find Convex client` / auth requests fail | Same cause as above — the URL is not baked into the bundle. |
| Deep links like `/product/abc` 404 | The SPA rewrite is missing; confirm `vercel.json` is committed at the repo root. |
| Sign-in doesn't complete after redirect | `SITE_URL` on the Convex deployment doesn't match the deployed origin. Update it under **API Keys → Backend**. |
| Data looks like the sandbox's data | Expected: the deployed frontend shares the same Convex deployment as the Freebuff sandbox. See below to separate them. |

## Optional: give production its own Convex deployment

The Vercel site currently shares the sandbox's Convex deployment, which is fine
for a demo but means demo data is shared with production. To separate them:

1. Create a production deployment in the Convex dashboard and copy its
   `https://<deployment>.convex.cloud` URL.
2. In Vercel, set `VITE_CONVEX_URL` to that URL and add `CONVEX_DEPLOY_KEY`
   (Convex dashboard → **Settings → Deploy Keys → Production**).
3. Change `buildCommand` in `vercel.json` to push functions as part of the build:

   ```json
   "buildCommand": "npx convex deploy --cmd 'bun run build'"
   ```

4. Re-create the backend variables from step 3 on the production deployment
   (`npx convex env set --prod SITE_URL ...`, plus the auth keys), then redeploy.
