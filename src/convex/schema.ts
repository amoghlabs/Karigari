import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
  ARTISAN: "artisan",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
  v.literal(ROLES.ARTISAN),
);
export type Role = Infer<typeof roleValidator>;

export const PRODUCT_CATEGORIES = [
  "Pottery & Terracotta",
  "Handloom Textiles",
  "Block Printing",
  "Jewelry",
  "Woodwork",
  "Metalwork",
  "Bamboo & Cane",
] as const;

export const categoryValidator = v.union(
  ...PRODUCT_CATEGORIES.map((c) => v.literal(c)),
);
export type Category = (typeof PRODUCT_CATEGORIES)[number];

export const ORDER_STATUSES = ["paid", "shipped", "delivered"] as const;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove
      phone: v.optional(v.string()), // artisan phone number (OTP verified)
      phoneVerificationTime: v.optional(v.number()), // when the phone was OTP verified

      role: v.optional(roleValidator), // role of the user. do not remove
    })
      .index("email", ["email"]) // index for the email. do not remove or modify
      .index("phone", ["phone"]), // one account per verified phone number

    // ---------- कारीgari ----------

    // A maker profile; seeded demo makers have no user, studio owners do.
    makers: defineTable({
      userId: v.optional(v.id("users")),
      shopName: v.string(),
      artisanName: v.optional(v.string()), // the maker's own name, shown in "Meet the artisan"
      bio: v.string(),
      location: v.string(),
      craft: v.string(), // primary craft, e.g. "Pottery & Terracotta"
      crafts: v.optional(v.array(v.string())), // all crafts the artisan works across; falls back to [craft]
      story: v.string(),
      image: v.optional(v.string()), // portrait/avatar URL
      coverImage: v.optional(v.string()),
      isFeatured: v.optional(v.boolean()),
    })
      .index("by_userId", ["userId"])
      .index("by_featured", ["isFeatured"]),

    // A handmade product listing.
    products: defineTable({
      makerId: v.id("makers"),
      title: v.string(),
      description: v.string(),
      category: categoryValidator,
      price: v.number(), // in rupees
      imageUrl: v.string(),
      materials: v.array(v.string()),
      madeToOrder: v.boolean(),
      stock: v.number(),
      isActive: v.boolean(),
      colors: v.optional(v.array(v.string())), // from Smart Cataloguing
      dimensions: v.optional(v.string()), // from Smart Cataloguing
      tags: v.optional(v.array(v.string())), // from Smart Cataloguing
      descriptionHi: v.optional(v.string()), // AI translation of the description
      daysAgo: v.optional(v.number()), // lower = newer; drives the "new arrivals" sort
    })
      .index("by_makerId", ["makerId"])
      .index("by_active", ["isActive"])
      .index("by_category", ["category"]),

    // One cart per user.
    carts: defineTable({
      userId: v.id("users"),
    }).index("by_userId", ["userId"]),

    cartItems: defineTable({
      cartId: v.id("carts"),
      productId: v.id("products"),
      quantity: v.number(),
    })
      .index("by_cartId", ["cartId"])
      .index("by_cartId_productId", ["cartId", "productId"]),

    favorites: defineTable({
      userId: v.id("users"),
      productId: v.id("products"),
    })
      .index("by_userId", ["userId"])
      .index("by_userId_productId", ["userId", "productId"]),

    orders: defineTable({
      userId: v.id("users"),
      status: v.union(...ORDER_STATUSES.map((s) => v.literal(s))),
      total: v.number(),
      fullName: v.string(),
      address: v.string(),
      createdAt: v.number(),
      paymentId: v.optional(v.string()), // gateway payment id (or demo id)
      paymentMethod: v.optional(v.string()), // "upi" | "card" | "razorpay" | "demoSale"
    }).index("by_userId", ["userId"]),

    orderItems: defineTable({
      orderId: v.id("orders"),
      productId: v.id("products"),
      productTitle: v.string(), // denormalized snapshot
      productImage: v.string(),
      makerId: v.id("makers"),
      quantity: v.number(),
      price: v.number(), // unit price at purchase time
    })
      .index("by_orderId", ["orderId"])
      .index("by_makerId", ["makerId"]),

    // Phone OTP codes for the artisan sign-up flow (demo SMS).
    phoneOtps: defineTable({
      phone: v.string(),
      code: v.string(),
      expiresAt: v.number(),
      used: v.boolean(),
    }).index("by_phone", ["phone"]),

    // One checkout per payment attempt (Razorpay order or demo checkout).
    checkoutSessions: defineTable({
      userId: v.id("users"),
      rzpOrderId: v.string(),
      amount: v.number(), // rupees, snapshot of the payable cart
      currency: v.string(),
      fullName: v.string(),
      address: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("placed"),
      ),
      rzpPaymentId: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_userId", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
