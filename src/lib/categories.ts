/** Indian craft categories (mirrors src/convex/schema.ts). */
export const PRODUCT_CATEGORIES = [
  "Pottery & Terracotta",
  "Handloom Textiles",
  "Block Printing",
  "Jewelry",
  "Woodwork",
  "Metalwork",
  "Bamboo & Cane",
] as const;

export type Category = (typeof PRODUCT_CATEGORIES)[number];

/** Emoji used as photo-icon tap targets in the low-literacy artisan onboarding. */
export const CATEGORY_ICON: Record<string, string> = {
  "Pottery & Terracotta": "🏺",
  "Handloom Textiles": "🧶",
  "Block Printing": "🖨️",
  Jewelry: "💍",
  Woodwork: "🪵",
  Metalwork: "🔔",
  "Bamboo & Cane": "🧺",
};