/** Client-safe copy of the product categories (mirrors src/convex/schema.ts). */
export const PRODUCT_CATEGORIES = [
  "Ceramics",
  "Textiles",
  "Woodwork",
  "Jewelry",
  "Leather",
  "Prints",
  "Candles",
] as const;

export type Category = (typeof PRODUCT_CATEGORIES)[number];
