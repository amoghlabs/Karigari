/**
 * Tests for the seed catalog invariants: every seeded product must be
 * well-formed (price, image, category, stock) and the freshness check that
 * decides when the catalog refreshes must behave (stale vs current).
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { seed } from "../convex/seed";

export const VALID_CATEGORIES = [
  "Pottery & Terracotta",
  "Handloom Textiles",
  "Block Printing",
  "Jewelry",
  "Woodwork",
  "Metalwork",
  "Bamboo & Cane",
] as const;

describe("seed catalog (seed.ts)", () => {
  const products = seed.flatMap((m) =>
    m.products.map((p) => ({ ...p, maker: m.shopName, makerCraft: m.craft })),
  );

  test("has a substantial catalog", () => {
    expect(products.length).toBeGreaterThanOrEqual(35);
  });

  test("every product is well-formed", () => {
    for (const p of products) {
      expect(p.title.trim().length).toBeGreaterThan(0);
      expect(p.price).toBeGreaterThan(0);
      expect(p.stock).toBeGreaterThan(0);
      expect(p.madeToOrder === true || p.madeToOrder === false).toBe(true);
      expect(p.description.trim().length).toBeGreaterThan(40);
      expect(p.materials.length).toBeGreaterThan(0);
    }
  });

  test("prices stay within the intended handmade range", () => {
    for (const p of products) {
      expect(p.price).toBeGreaterThanOrEqual(500);
      expect(p.price).toBeLessThanOrEqual(8000);
    }
  });

  test("every product belongs to a valid craft category", () => {
    for (const p of products) {
      expect(VALID_CATEGORIES).toContain(p.category);
    }
  });

  test("every product image is a craft-themed Unsplash photo with sizing params", () => {
    for (const p of products) {
      expect(p.imageUrl).toMatch(/^https:\/\/images\.unsplash\.com\/photo-[a-z0-9-]+\?w=800&h=800&fit=crop$/);
    }
  });

  test("product images are unique across the catalog", () => {
    const urls = products.map((p) => p.imageUrl);
    expect(new Set(urls).size).toBe(urls.length);
  });

  test("maker primary craft matches one of the maker's product categories", () => {
    for (const m of seed) {
      const cats = new Set(m.products.map((p) => p.category));
      expect(cats.has(m.craft)).toBe(true);
    }
  });

  test("seed image ids differ from maker portrait/cover ids (product imagery scope)", () => {
    const productIds = new Set(
      products.map((p) => p.imageUrl.match(/photo-([a-z0-9-]+)\?/)?.[1]),
    );
    for (const m of seed) {
      for (const extra of [m.image, m.coverImage]) {
        if (!extra) continue;
        const id = extra.match(/photo-([a-z0-9-]+)\?/)?.[1];
        if (!id) continue;
        expect(productIds.has(id)).toBe(false);
      }
    }
  });
});

describe("seed freshness check (seedCatalog)", () => {
  const src = readFileSync(
    resolve(import.meta.dir, "../convex/seed.ts"),
    "utf8",
  );

  test("freshness compares both titles and imageUrls (so image-only updates propagate)", () => {
    expect(src).toMatch(/expectedByTitle/);
    expect(src).toMatch(/current\.imageUrl !== imageUrl/);
  });

  test("refresh only deletes seed makers (never user-created studios)", () => {
    expect(src).toMatch(/if \(m\.userId\) continue;/);
  });

  test("the seed inserts the daysAgo column (drives new-arrivals sort)", () => {
    expect(src).toMatch(/daysAgo: p\.daysAgo/);
  });
});
