# कारीgari

**Sell with AI: a photo and your voice.**

> Not another handicraft marketplace — a platform that removes the digital barrier for Indian artisans.

Built for Smart India Hackathon (SIH) — internal round.

---

## The Problem

Talented artisans across India create beautiful, culturally rich handmade work — but most have no way to sell it online. Listing a product usually means knowing how to take good photos, write descriptions, price competitively, and navigate a marketplace's interface — barriers that shut out exactly the people whose work deserves to be seen.

## The Solution

कारीgari lets an artisan list a product with just a photo and their voice, in their own language. AI handles the rest.

### Sell with AI
1. Take/upload a photo
2. Speak about the product, in any language
3. AI enhances the photo
4. AI writes the product description
5. AI translates it
6. AI suggests a category and a fair price — with the reasoning shown, not just a number
7. The product goes live

### For buyers
- Browse and buy directly from artisans — no middlemen
- **Meet the Artisan** — see who made it: their photo, location, craft, and personal story
- AI-generated cultural storytelling on every product — the craft's origin, technique, and significance
- Personalized recommendations and demand insights

## Key Features

- Phone + OTP login — no passwords, minimal typing, built for users with little to no tech background. One phone number always resolves to one account, so returning artisans keep their studio and returning buyers keep their order history
- Smart Cataloguing — AI extracts product attributes (name, category, materials, colors, dimensions, tags) straight from a photo
- Voice-to-structured-story — regional-language voice input becomes a polished, structured listing
- AI Pricing Manager — factors in photo quality, material cost, and past sales, and explains its reasoning
- Full-page English ↔ Hindi toggle
- Virtual business advisor with ongoing tips for artisans

## Tech Stack

- **Backend:** Convex (real-time database + serverless functions)
- **Payments:** Razorpay (demo checkout fallback when keys are absent)
- **Deployment:** Vercel (static frontend) + Convex production deployment
- Built and iterated on using [FreeBuff](https://freebuff.dev)

## Design

A warm, traditional Indian craft aesthetic — terracotta, indigo, and turmeric tones, serif headings with Devanagari script support, and textures inspired by block printing and handmade paper — deliberately avoiding a generic "SaaS" look.

## Live Demo

[tasty-gifts-mate.freebuff.dev](https://tasty-gifts-mate.freebuff.dev)

## Deployment

Vercel hosts the built frontend; the Convex deployment behind it provides the
database and functions. `vercel.json` is already configured (static `bun run
build`, SPA rewrites, immutable asset caching), and the Convex types under
`src/convex/_generated` are committed so a fresh clone typechecks and builds
without the Convex CLI.

The full walkthrough lives in [**DEPLOYMENT.md**](./DEPLOYMENT.md). The short
version:

1. Import the repo into Vercel (framework preset: Vite).
2. Add `VITE_CONVEX_URL` (the deployment's `https://<deployment>.convex.cloud`
   URL) to the Vercel project's environment variables.
3. Deploy.

## Team

Built by a 6-person team from JSS University (B.Tech CSE, AI/ML).

## Getting Started

```bash
bun install
bunx convex dev        # starts the Convex dev deployment and generates src/convex/_generated
bun run dev            # Vite dev server
```

`VITE_CONVEX_URL` is injected for you in the hosted FreeBuff environment. To run
outside it, point that variable at your own Convex deployment and set the
backend variables described in [DEPLOYMENT.md](./DEPLOYMENT.md).

Optional backend keys, each of which enables a feature and falls back cleanly
when absent: `OPENAI_API_KEY` (AI writing, translation and pricing reasoning),
`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (live checkout).

---

_SIH internal hackathon submission — कारीgari removes the digital barrier for Indian artisans._
