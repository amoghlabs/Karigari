import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import type { DataModel, Doc, Id } from "./_generated/dataModel";

/** Any Convex function context that can read the database. */
type DbCtx = GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>;

/**
 * Shared order finalizer used by both the live Razorpay flow and the demo
 * checkout. Snapshots line items, inserts the order, decrements stock and
 * clears the buyer's cart.
 */
export async function finalizeOrder(
  ctx: GenericMutationCtx<DataModel>,
  {
    userId,
    fullName,
    address,
    lines,
    paymentId,
    paymentMethod,
  }: {
    userId: Id<"users">;
    fullName: string;
    address: string;
    lines: Array<{
      productId: Id<"products">;
      title: string;
      image: string;
      quantity: number;
      price: number;
    }>;
    paymentId: string;
    paymentMethod: string;
  },
): Promise<{ orderId: Id<"orders">; total: number; paymentId: string }> {
  if (!lines || lines.length === 0)
    throw new Error("Nothing left to check out.");

  let total = 0;
  for (const line of lines) total += line.price * line.quantity;

  const orderId = await ctx.db.insert("orders", {
    userId,
    status: "paid",
    total,
    fullName,
    address,
    createdAt: Date.now(),
    paymentId,
    paymentMethod,
  });

  for (const line of lines) {
    const product = (await ctx.db.get(line.productId)) as Doc<"products"> | null;
    if (!product) continue;

    await ctx.db.insert("orderItems", {
      orderId,
      productId: product._id,
      productTitle: line.title,
      productImage: line.image,
      makerId: product.makerId,
      quantity: line.quantity,
      price: line.price,
    });

    await ctx.db.patch(product._id, {
      stock: Math.max(0, product.stock - line.quantity),
    });
  }

  // Clear the buyer's cart now that the order exists.
  const cart = await ctx.db
    .query("carts")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
  if (cart) {
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cartId", (q) => q.eq("cartId", cart._id))
      .collect();
    for (const item of items) await ctx.db.delete(item._id);
  }

  return { orderId, total, paymentId };
}

/**
 * Loads + validates the buyer's cart into payable lines (skips inactive
 * products, clamps to stock). Shared by the demo checkout and the internal
 * verified-order mutation.
 */
export async function loadPayableLines(
  ctx: DbCtx,
  userId: Id<"users">,
): Promise<{
  lines: Array<{
    productId: Id<"products">;
    title: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
}> {
  const cart = await ctx.db
    .query("carts")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
  if (!cart) throw new Error("Your bag is empty.");

  const items = await ctx.db
    .query("cartItems")
    .withIndex("by_cartId", (q) => q.eq("cartId", cart._id))
    .collect();
  if (items.length === 0) throw new Error("Your bag is empty.");

  const lines = [];
  let subtotal = 0;
  for (const item of items) {
    const product = (await ctx.db.get(item.productId)) as Doc<"products"> | null;
    if (!product || !product.isActive) continue;
    const qty = Math.min(item.quantity, product.stock);
    if (qty <= 0) continue;
    lines.push({
      productId: product._id,
      title: product.title,
      image: product.imageUrl,
      quantity: qty,
      price: product.price,
    });
    subtotal += product.price * qty;
  }
  if (lines.length === 0) throw new Error("Nothing left to check out.");
  return { lines, subtotal };
}
