# Deploying कारीgari to Vercel

The frontend is a Vite SPA and the backend is Convex, so a deployment has two
halves: the **Vercel project** (static build) and the **Convex production
deployment** (database + functions). `vercel.json` is already configured for
this — the only things you provide are environment variables and a deploy key.

```
vercel.json
  installCommand   bun install
  buildCommand     npx convex deploy --cmd 'bun run build'
  outputDirectory  dist
  rewrites         all non-asset routes -> /index.html   (SPA routing)
```

`npx convex deploy` pushes `src/convex/` to production **and** regenerates
`src/convex/_generated`, which the build needs. That directory is gitignored, so
without this step `tsc -b` fails on a fresh clone with `Cannot find module
'./_generated/server'`.

---

## 1. Create the Vercel project

1. Push this repository to GitHub/GitLab.
2. In the Vercel dashboard: **Add New → Project → Import** the repo.
3. Framework preset: **Vite** (already pinned in `vercel.json`). Leave Build
   Command / Output Directory as-is — `vercel.json` overrides them.

## 2. Set Vercel environment variables

Project → **Settings → Environment Variables**. Add these for **Production**
(and Preview if you want preview deploys to work):

| Variable | Value |
| --- | --- |
| `CONVEX_DEPLOY_KEY` | Production deploy key from the Convex dashboard (see step 3) |
| `VITE_CONVEX_URL` | `https://<your-deployment>.convex.cloud` — the **production** deployment URL |

`VITE_CONVEX_URL` is baked into the client bundle at build time, so it must be
present before the first build, and a change requires a redeploy.

## 3. Get the Convex deploy key

Convex dashboard → your project → **Settings → Deploy Keys → Generate Production
Deploy Key**. Paste the value into `CONVEX_DEPLOY_KEY` in Vercel.

This key both pushes functions and generates types during the Vercel build.

## 4. Set the Convex-side environment variables

These live on the Convex **production** deployment, not in Vercel. Set them from
a machine with this repo checked out:

```bash
# Authenticate the CLI and target the production deployment
npx convex login
npx convex env set --prod SITE_URL https://<your-app>.vercel.app
```

Then the auth keys required by Convex Auth (`src/convex/auth.ts`,
`src/convex/auth.config.ts` — do not edit those files):

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Public origin of the deployed site. Must match the Vercel URL exactly (no trailing slash) or auth redirects break. Add the custom domain here too if you attach one. |
| `JWKS` | Public JWKS for signing/verifying auth tokens |
| `JWT_PRIVATE_KEY` | Private key for signing auth tokens |

Generate the key pair with the Convex Auth CLI (`npx @convex-dev/auth --prod`) or
copy the pair already generated for your dev deployment and set it on prod:

```bash
npx convex env set --prod JWKS '<json-jwks>'
npx convex env set --prod JWT_PRIVATE_KEY '<private-key>'
```

Optional features — the app degrades gracefully when these are absent, but the
matching feature is disabled:

| Variable | Enables |
| --- | --- |
| `OPENAI_API_KEY` | AI description / translation / cultural-story and pricing reasoning (`src/convex/aiStory.ts`). Without it the deterministic fallbacks are used. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Real Razorpay checkout. Without them the demo checkout path is used. |
| `VLY_INTEGRATION_KEY` | Only when running the app on Vly/Freebuff-hosted integrations. Not needed on Vercel. |

List what is currently set with:

```bash
npx convex env list --prod
```

## 5. Deploy

Trigger a deploy from the Vercel dashboard or push to the production branch.

The build runs:

1. `bun install`
2. `npx convex deploy` → pushes `src/convex/`, regenerates `_generated`
3. `bun run build` → `tsc -b && vite build`
4. Vercel serves `dist/` with SPA fallback from `vercel.json`

## 6. Verify

- `/` renders the landing page (not a 404) — confirms the SPA rewrite.
- Open `/shop`, then hard-refresh: the route must still resolve, not 404.
- Sign in through `/auth`, then confirm the dashboard loads — this proves
  `VITE_CONVEX_URL` and `SITE_URL` are correct.
- Place a test order — this proves the Convex functions were pushed.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Build fails with `Cannot find module './_generated/server'` | `CONVEX_DEPLOY_KEY` is missing, so `npx convex deploy` didn't run/regenerate. Add it and redeploy. |
| Build fails with `No CONVEX_DEPLOY_KEY found` / auth error | The key is expired or was added to the wrong environment (e.g. Preview only). |
| Deployed app shows a blank page or "Could not find Convex client" | `VITE_CONVEX_URL` is missing or still points at the dev deployment. Set it and redeploy so it is re-baked into the bundle. |
| Sign-in loops back to `/auth` | `SITE_URL` on the Convex deployment does not match the deployed origin. Update it with `npx convex env set --prod SITE_URL ...`. |
| Data from the sandbox/dev deployment is missing | Expected: production Convex is a separate database. Re-seed if needed (`src/convex/seed.ts`). |

## Notes

- Vercel's build image supports Bun, and `installCommand: "bun install"` plus the
  committed `bun.lock` pin the install.
- Do not change `vite.config.ts` HMR settings in the Freebuff preview
  environment; `server.hmr` is intentionally left as configured.
- `convex.json` (`"functions": "src/convex/"`) is what tells the Convex CLI where
  the backend lives — keep it in sync if the folder ever moves.
