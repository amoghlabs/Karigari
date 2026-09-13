# कारीgari

**Sell with AI: a photo and your voice.**

> Not another handicraft marketplace — a platform that removes the digital barrier for Indian artisans.

Built for Smart India Hackathon (SIH)

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

- Phone + OTP login (via 2Factor.in) — no passwords, minimal typing, built for users with little to no tech background
- Smart Cataloguing — AI extracts product attributes (name, category, materials, colors, dimensions, tags) straight from a photo
- Voice-to-structured-story — regional-language voice input becomes a polished, structured listing
- AI Pricing Manager — factors in photo quality, material cost, and past sales, and explains its reasoning
- Full-page English ↔ Hindi toggle
- Virtual business advisor with ongoing tips for artisans

## Tech Stack

- **Backend:** Convex (real-time database + serverless functions)
- **OTP/SMS:** 2Factor.in
- **Payments:** _add provider once finalized_
- Built and iterated on using [FreeBuff](https://freebuff.dev)

## Design

A warm, traditional Indian craft aesthetic — terracotta, indigo, and turmeric tones, serif headings with Devanagari script support, and textures inspired by block printing and handmade paper — deliberately avoiding a generic "SaaS" look.

## Live Demo

[tasty-gifts-mate.freebuff.dev](https://tasty-gifts-mate.freebuff.dev)

## Team

Built by a 6-person team from JSS University (B.Tech CSE, AI/ML).

## Getting Started

The app is built and hosted on FreeBuff. To pull the source locally:
1. Open the project on FreeBuff and use the **Code** button to get a browser-based VS Code environment.
2. Download the project folders as a zip from there.
3. Set up your own Convex deployment and environment variables (`TWOFACTOR_API_KEY`, etc.) to run it outside FreeBuff.

---

_SIH internal hackathon submission — कारीgari removes the digital barrier for Indian artisans._
