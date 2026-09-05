import { query } from "./_generated/server";
import { v } from "convex/values";

export const SORT_OPTIONS = [
  "featured",
  "price-asc",
  "price-desc",
  "newest",
] as const;

/** Active products, joined with their maker, filtered by search/category/price and sorted. */
export const listProducts = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    maxPrice: v.optional(v.number()),
    sort: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    if (args.category && args.category !== "All") {
      products = products.filter((p) => p.category === args.category);
    }

    const search = args.search?.trim().toLowerCase();
    if (search) {
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.materials.some((m) => m.toLowerCase().includes(search)),
      );
    }

    const maxPrice = args.maxPrice;
    if (typeof maxPrice === "number") {
      products = products.filter((p) => p.price <= maxPrice);
    }

    const sort = args.sort ?? "featured";
    if (sort === "price-asc") products.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") products.sort((a, b) => b.price - a.price);
    else if (sort === "newest")
      products.sort((a, b) => b._creationTime - a._creationTime);
    else
      products.sort(
        (a, b) => a._creationTime - b._creationTime, // featured = catalog order
      );

    const slice = products.slice(0, args.limit ?? products.length);
    return Promise.all(
      slice.map(async (product) => ({
        ...product,
        maker: await ctx.db.get(product.makerId),
      })),
    );
  },
});

/** Single product with its maker (for the detail page). */
export const getProduct = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;
    const maker = await ctx.db.get(product.makerId);
    return { ...product, maker };
  },
});

/** Maker profile + their active products, for the storefront page. */
export const getMaker = query({
  args: { id: v.id("makers") },
  handler: async (ctx, args) => {
    const maker = await ctx.db.get(args.id);
    if (!maker) return null;
    const products = await ctx.db
      .query("products")
      .withIndex("by_makerId", (q) => q.eq("makerId", args.id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    return { ...maker, products };
  },
});

export const listFeaturedMakers = query({
  handler: async (ctx) => {
    const makers = await ctx.db
      .query("makers")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();
    return Promise.all(
      makers.map(async (maker) => {
        const products = await ctx.db
          .query("products")
          .withIndex("by_makerId", (q) => q.eq("makerId", maker._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();
        return {
          ...maker,
          productCount: products.length,
          sampleImages: products.slice(0, 3).map((p) => p.imageUrl),
        };
      }),
    );
  },
});
