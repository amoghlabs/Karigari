import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { PRODUCT_CATEGORIES, categoryValidator } from "./schema";

/** The signed-in user's maker profile, if they created one. */
export const myMaker = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return ctx.db
      .query("makers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

/** Create the studio profile from the onboarding form. One per user. */
export const createMaker = mutation({
  args: {
    shopName: v.string(),
    artisanName: v.optional(v.string()),
    craft: v.string(),
    crafts: v.optional(v.array(v.string())),
    location: v.string(),
    bio: v.string(),
    story: v.string(),
    image: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to open your studio.");

    const shopName = args.shopName.trim();
    if (shopName.length < 2) throw new Error("Give your shop a name.");

    const existing = await ctx.db
      .query("makers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (existing) throw new Error("You already have a studio.");

    // One studio, many crafts: keep every selected craft, with the first as
    // primary. Unknown categories are dropped; none-valid keeps the primary.
    const validCrafts = Array.from(
      new Set([args.craft, ...(args.crafts ?? [])]),
    ).filter((c) => CATEGORIES.includes(c));
    const crafts = validCrafts.length > 0 ? validCrafts : [args.craft];

    const storedImage = args.imageStorageId
      ? await ctx.storage.getUrl(args.imageStorageId)
      : undefined;
    const image = args.image ?? storedImage ?? undefined;

    return ctx.db.insert("makers", {
      userId,
      shopName,
      artisanName: args.artisanName?.trim() || undefined,
      craft: crafts[0],
      crafts,
      location: args.location.trim() || "Somewhere handmade",
      bio: args.bio.trim() || shopName,
      story: args.story.trim() || shopName,
      image,
      coverImage: args.coverImage,
      isFeatured: false,
    });
  },
});

/** Update the studio profile. */
export const updateMaker = mutation({
  args: {
    makerId: v.id("makers"),
    shopName: v.string(),
    artisanName: v.optional(v.string()),
    craft: v.string(),
    crafts: v.optional(v.array(v.string())),
    location: v.string(),
    bio: v.string(),
    story: v.string(),
    image: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in.");

    const maker = await ctx.db.get(args.makerId);
    if (!maker) throw new Error("Studio not found.");
    if (maker.userId !== userId) throw new Error("Not your studio.");

    // Same multi-craft normalization as createMaker.
    const validCrafts = Array.from(
      new Set([args.craft, ...(args.crafts ?? [])]),
    ).filter((c) => CATEGORIES.includes(c));
    const crafts = validCrafts.length > 0 ? validCrafts : [maker.craft];

    // A freshly uploaded profile photo (or URL) replaces the current one.
    const storedImage = args.imageStorageId
      ? await ctx.storage.getUrl(args.imageStorageId)
      : undefined;
    const image = args.image?.trim() || storedImage || undefined;

    await ctx.db.patch(args.makerId, {
      shopName: args.shopName.trim() || maker.shopName,
      artisanName: args.artisanName?.trim() || maker.artisanName,
      craft: crafts[0],
      crafts,
      location: args.location.trim() || maker.location,
      bio: args.bio.trim() || maker.bio,
      story: args.story.trim() || maker.story,
      ...(image ? { image } : {}),
    });
    return { ok: true };
  },
});

const CATEGORIES = PRODUCT_CATEGORIES as readonly string[];

/** The studio's listings with live stats (views are simulated client-side noise-free). */
export const myListings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const maker = await ctx.db
      .query("makers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!maker) return null;

    const products = await ctx.db
      .query("products")
      .withIndex("by_makerId", (q) => q.eq("makerId", maker._id))
      .collect();
    products.sort((a, b) => b._creationTime - a._creationTime);

    return {
      maker: { ...maker, crafts: maker.crafts ?? [maker.craft] },
      products,
    };
  },
});

/**
 * The real numbers behind the AI's price suggestion: what similar pieces
 * actually sell for across the market, and what this studio has sold before.
 * "Sell with AI" shows these to the artisan so the number is explainable.
 */
export const pricingContext = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const maker = await ctx.db
      .query("makers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!maker) return null;

    // Market prices for every live piece, grouped by craft category.
    const active = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const categoryStats: Record<
      string,
      { count: number; avgPrice: number; minPrice: number; maxPrice: number }
    > = {};
    for (const product of active) {
      const stat = (categoryStats[product.category] ??= {
        count: 0,
        avgPrice: 0,
        minPrice: Number.POSITIVE_INFINITY,
        maxPrice: 0,
      });
      stat.count += 1;
      stat.avgPrice += product.price;
      stat.minPrice = Math.min(stat.minPrice, product.price);
      stat.maxPrice = Math.max(stat.maxPrice, product.price);
    }
    for (const stat of Object.values(categoryStats)) {
      stat.avgPrice = Math.round(stat.avgPrice / stat.count);
      if (!Number.isFinite(stat.minPrice)) stat.minPrice = stat.avgPrice;
    }

    // This studio's own sales history — the "your past sales" part.
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_makerId", (q) => q.eq("makerId", maker._id))
      .collect();
    const soldTotal = items.reduce((sum, item) => sum + item.price, 0);
    const pastSales = {
      count: items.length,
      units: items.reduce((sum, item) => sum + item.quantity, 0),
      avgPrice: items.length > 0 ? Math.round(soldTotal / items.length) : 0,
    };

    // And their live listings, so a new piece sits next to its siblings.
    const mine = active.filter((p) => p.makerId === maker._id);
    const myAvgPrice =
      mine.length > 0
        ? Math.round(mine.reduce((sum, p) => sum + p.price, 0) / mine.length)
        : 0;

    return {
      crafts: maker.crafts ?? [maker.craft],
      myListings: mine.length,
      myAvgPrice,
      pastSales,
      categoryStats,
    };
  },
});

/** Publish a new listing. */
export const createProduct = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    descriptionHi: v.optional(v.string()),
    category: categoryValidator,
    price: v.number(),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    materials: v.array(v.string()),
    madeToOrder: v.boolean(),
    stock: v.number(),
    colors: v.optional(v.array(v.string())),
    dimensions: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in.");

    const maker = await ctx.db
      .query("makers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!maker) throw new Error("Create your studio first.");

    const title = args.title.trim();
    if (title.length < 3) throw new Error("Give your piece a name.");
    if (args.price <= 0) throw new Error("Price must be greater than zero.");

    const imageUrl =
      args.imageUrl?.trim() ??
      (args.imageStorageId ? await ctx.storage.getUrl(args.imageStorageId) : "");
    if (!imageUrl) throw new Error("Add a photo of your piece.");

    return ctx.db.insert("products", {
      makerId: maker._id,
      title,
      description: args.description.trim() || "A handmade piece.",
      descriptionHi: args.descriptionHi?.trim() || undefined,
      category: args.category,
      price: Math.round(args.price * 100) / 100,
      imageUrl,
      materials: args.materials.filter((m) => m.trim().length > 0),
      madeToOrder: args.madeToOrder,
      stock: Math.max(0, Math.round(args.stock)),
      isActive: true,
      colors: args.colors?.filter((c) => c.trim().length > 0),
      dimensions: args.dimensions?.trim() || undefined,
      tags: args.tags?.filter((t) => t.trim().length > 0),
    });
  },
});

/** Edit an existing listing. */
export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    title: v.string(),
    description: v.string(),
    descriptionHi: v.optional(v.string()),
    category: categoryValidator,
    price: v.number(),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    materials: v.array(v.string()),
    madeToOrder: v.boolean(),
    stock: v.number(),
    isActive: v.boolean(),
    colors: v.optional(v.array(v.string())),
    dimensions: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in.");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Listing not found.");

    const maker = await ctx.db.get(product.makerId);
    if (!maker || maker.userId !== userId)
      throw new Error("Not your listing.");

    const storedImage = args.imageStorageId
      ? await ctx.storage.getUrl(args.imageStorageId)
      : undefined;
    const imageUrl =
      args.imageUrl?.trim() || storedImage || product.imageUrl;

    await ctx.db.patch(args.productId, {
      title: args.title.trim() || product.title,
      description: args.description.trim() || product.description,
      ...(args.descriptionHi !== undefined
        ? { descriptionHi: args.descriptionHi.trim() || undefined }
        : {}),
      category: CATEGORIES.includes(args.category)
        ? args.category
        : product.category,
      price: Math.max(0.5, Math.round(args.price * 100) / 100),
      imageUrl,
      materials: args.materials.filter((m) => m.trim().length > 0),
      madeToOrder: args.madeToOrder,
      stock: Math.max(0, Math.round(args.stock)),
      isActive: args.isActive,
      ...(args.colors !== undefined
        ? { colors: args.colors.filter((c) => c.trim().length > 0) }
        : {}),
      ...(args.dimensions !== undefined
        ? { dimensions: args.dimensions.trim() || undefined }
        : {}),
      ...(args.tags !== undefined ? { tags: args.tags.filter((t) => t.trim().length > 0) } : {}),
    });
    return { ok: true };
  },
});

/** Upload URL for artisan photos (Convex storage). */
export const getUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return ctx.storage.generateUploadUrl();
  },
});

/** Soft-delete a listing (hide it from the marketplace). */
export const retireProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in.");

    const product = await ctx.db.get(productId);
    if (!product) return { ok: false };

    const maker = await ctx.db.get(product.makerId);
    if (!maker || maker.userId !== userId)
      throw new Error("Not your listing.");

    await ctx.db.patch(productId, { isActive: false });
    return { ok: true };
  },
});

/** Orders containing this studio's pieces — the maker's sales feed. */
export const mySales = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const maker = await ctx.db
      .query("makers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!maker) return null;

    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_makerId", (q) => q.eq("makerId", maker._id))
      .collect();
    items.sort((a, b) => b._creationTime - a._creationTime);

    return Promise.all(
      items.map(async (item) => {
        const order = await ctx.db.get(item.orderId);
        return { ...item, order };
      }),
    );
  },
});
