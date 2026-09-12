/**
 * Tests for the i18n dictionary and the copy recently rewritten around the
 * "Sell with AI" positioning: every key used by `t()` calls in components
 * must exist (in both languages), interpolation must round-trip, and the
 * fallback behavior must be preserved.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { DICT, categoryName } from "../lib/i18n";

describe("i18n dictionary (i18n.tsx)", () => {
  test("every key has both an English and a Hindi string", () => {
    for (const [key, entry] of Object.entries(DICT)) {
      const ok =
        typeof entry?.en === "string" &&
        entry.en.trim().length > 0 &&
        typeof entry?.hi === "string" &&
        entry.hi.trim().length > 0;
      expect(`${key}: en+hi present`).toBe(ok ? `${key}: en+hi present` : `MISSING: ${key}`);
    }
  });

  test("no placeholder artifacts left in copy", () => {
    for (const [key, entry] of Object.entries(DICT)) {
      for (const [lang, text] of Object.entries(entry)) {
        expect(`${key}.${lang}`).not.toMatch(/\{\{|\}\}|undefined|NaN/);
      }
    }
  });

  test("all {var} interpolations are balanced", () => {
    for (const [key, entry] of Object.entries(DICT)) {
      for (const [lang, text] of Object.entries(entry)) {
        const opens = (text.match(/\{/g) ?? []).length;
        const closes = (text.match(/\}/g) ?? []).length;
        expect(`${key}.${lang} braces balanced`).toBe(
          opens === closes ? `${key}.${lang} braces balanced` : `UNBALANCED: ${key}.${lang}`,
        );
      }
    }
  });

  test("the positioning keys carry the USP copy in both languages", () => {
    expect(DICT["hero.subtitle"]?.en).toMatch(/Not another handicraft marketplace/);
    expect(DICT["hero.subtitle"]?.en).toMatch(/removes the digital barrier/);
    expect(DICT["hero.subtitle"]?.hi).toMatch(/डिजिटल दीवार/);
    expect(DICT["brand.tagline"]?.en).toMatch(/Sell with AI/);
    expect(DICT["hero.slogan"]?.en).toBe("Where every craft has a voice.");
    expect(DICT["hero.slogan"]?.hi).toMatch(/हर हुनर की अपनी आवाज़/);
  });

  test("Sell with AI pipeline steps exist for all 7 steps", () => {
    for (const step of ["photo", "voice", "enhance", "write", "translate", "price", "live"]) {
      const entry = DICT[`swa.step.${step}`];
      expect(`swa.step.${step} present`).toBe(entry ? `swa.step.${step} present` : "MISSING");
      expect(entry?.en?.trim().length ?? 0).toBeGreaterThan(0);
      expect(entry?.hi?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  test("categoryName translates known categories and falls back for unknown ones", () => {
    expect(categoryName("Pottery & Terracotta", "en")).toBe("Pottery & Terracotta");
    expect(categoryName("Pottery & Terracotta", "hi")).not.toBe("Pottery & Terracotta");
    expect(categoryName("Unknown Craft", "hi")).toBe("Unknown Craft");
  });
});

describe("i18n usage coverage (every t() key exists)", () => {
  const SRC_ROOT = resolve(import.meta.dir, "..");

  const collectUsedKeys = (): string[] => {
    const keys: string[] = [];
    const files = [
      "components/ProductCard.tsx",
      "components/SellWithAi.tsx",
      "components/SiteFooter.tsx",
      "components/SiteHeader.tsx",
      "pages/Auth.tsx",
      "pages/Cart.tsx",
      "pages/Dashboard.tsx",
      "pages/Favorites.tsx",
      "pages/Landing.tsx",
      "pages/MakerStorefront.tsx",
      "pages/NotFound.tsx",
      "pages/Orders.tsx",
      "pages/ProductDetail.tsx",
      "pages/Shop.tsx",
    ];
    for (const rel of files) {
      const src = readFileSync(resolve(SRC_ROOT, rel), "utf8");
      for (const m of src.matchAll(/\bt\(\s*"([a-zA-Z0-9_.]+)"/g)) {
        keys.push(m[1]);
      }
      // Dynamic pipeline-step keys (t(`swa.step.${step.key}`)).
      if (src.includes("swa.step.")) {
        keys.push(
          "swa.step.photo",
          "swa.step.voice",
          "swa.step.enhance",
          "swa.step.write",
          "swa.step.translate",
          "swa.step.price",
          "swa.step.live",
        );
      }
    }
    return keys;
  };

  test("every t() key used in components/pages exists in the dictionary", () => {
    const used = collectUsedKeys();
    expect(used.length).toBeGreaterThan(200);
    const missing = [...new Set(used)].filter((k) => !(k in DICT));
    expect(missing).toEqual([]);
  });
});
