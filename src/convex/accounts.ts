import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * One person, one account.
 *
 * Signing in with Convex Auth creates a fresh anonymous user each time a
 * session starts, so a returning artisan (or buyer) could end up spread across
 * several user documents that share the same verified phone/email — losing
 * their studio, listings and order history. `mergeUsersInto` folds every
 * duplicate into the account the current session belongs to, so verification
 * always resolves to the same, complete identity.
 */
export async function mergeUsersInto(
  ctx: MutationCtx,
  keepUserId: Id<"users">,
  duplicates: Doc<"users">[],
) {
  const keeper = await ctx.db.get(keepUserId);
  if (!keeper) return;

  // Preserve any identity details only the duplicate carries (email/name/photo).
  const identity: Partial<Doc<"users">> = {};
  if (!keeper.name) {
    const withName = duplicates.find((d) => d.name);
    if (withName?.name) identity.name = withName.name;
  }
  if (!keeper.email) {
    const withEmail = duplicates.find((d) => d.email);
    if (withEmail?.email) {
      identity.email = withEmail.email;
      identity.emailVerificationTime = withEmail.emailVerificationTime;
    }
  }
  if (!keeper.image) {
    const withImage = duplicates.find((d) => d.image);
    if (withImage?.image) identity.image = withImage.image;
  }
  if (Object.keys(identity).length > 0) {
    await ctx.db.patch(keepUserId, identity);
  }

  for (const dup of duplicates) {
    if (dup._id === keepUserId) continue;

    // Studio profiles (products follow their makerId automatically).
    const makers = await ctx.db
      .query("makers")
      .withIndex("by_userId", (q) => q.eq("userId", dup._id))
      .collect();
    for (const maker of makers) {
      await ctx.db.patch(maker._id, { userId: keepUserId });
    }

    // Bag / saved pieces.
    const carts = await ctx.db
      .query("carts")
      .withIndex("by_userId", (q) => q.eq("userId", dup._id))
      .collect();
    for (const cart of carts) {
      await ctx.db.patch(cart._id, { userId: keepUserId });
    }

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId", (q) => q.eq("userId", dup._id))
      .collect();
    for (const favorite of favorites) {
      const mine = await ctx.db
        .query("favorites")
        .withIndex("by_userId_productId", (q) =>
          q.eq("userId", keepUserId).eq("productId", favorite.productId),
        )
        .first();
      if (mine) await ctx.db.delete(favorite._id);
      else await ctx.db.patch(favorite._id, { userId: keepUserId });
    }

    // Order history — this is what makes "Track orders" survive a re-login.
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", dup._id))
      .collect();
    for (const order of orders) {
      await ctx.db.patch(order._id, { userId: keepUserId });
    }

    // Pending/placed checkout attempts.
    const sessions = await ctx.db
      .query("checkoutSessions")
      .withIndex("by_userId", (q) => q.eq("userId", dup._id))
      .collect();
    for (const session of sessions) {
      await ctx.db.patch(session._id, { userId: keepUserId });
    }

    // Keep any live auth sessions pointing at the surviving account.
    const authSessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", dup._id))
      .collect();
    for (const session of authSessions) {
      await ctx.db.patch(session._id, { userId: keepUserId });
    }

    // Preserve email/OAuth sign-in methods, dropping true duplicates.
    const accounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", dup._id))
      .collect();
    for (const account of accounts) {
      const existing = await ctx.db
        .query("authAccounts")
        .withIndex("userIdAndProvider", (q) =>
          q.eq("userId", keepUserId).eq("provider", account.provider),
        )
        .first();
      if (existing) {
        const codes = await ctx.db
          .query("authVerificationCodes")
          .withIndex("accountId", (q) => q.eq("accountId", account._id))
          .collect();
        for (const code of codes) await ctx.db.delete(code._id);
        await ctx.db.delete(account._id);
      } else {
        await ctx.db.patch(account._id, { userId: keepUserId });
      }
    }

    await ctx.db.delete(dup._id);
  }

  await consolidateMakers(ctx, keepUserId);
  await consolidateCarts(ctx, keepUserId);
}

/** A user with two studios would orphan listings — keep one, move the rest. */
async function consolidateMakers(ctx: MutationCtx, userId: Id<"users">) {
  const makers = await ctx.db
    .query("makers")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  if (makers.length <= 1) return;
  const [keep, ...rest] = makers;
  for (const maker of rest) {
    const products = await ctx.db
      .query("products")
      .withIndex("by_makerId", (q) => q.eq("makerId", maker._id))
      .collect();
    for (const product of products) {
      await ctx.db.patch(product._id, { makerId: keep._id });
    }
    await ctx.db.delete(maker._id);
  }
}

/** A user with two carts would hide one — merge the lines, drop the extra. */
async function consolidateCarts(ctx: MutationCtx, userId: Id<"users">) {
  const carts = await ctx.db
    .query("carts")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  if (carts.length <= 1) return;
  const [keep, ...rest] = carts;
  for (const cart of rest) {
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cartId", (q) => q.eq("cartId", cart._id))
      .collect();
    for (const item of items) {
      const existing = await ctx.db
        .query("cartItems")
        .withIndex("by_cartId_productId", (q) =>
          q.eq("cartId", keep._id).eq("productId", item.productId),
        )
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, {
          quantity: existing.quantity + item.quantity,
        });
        await ctx.db.delete(item._id);
      } else {
        await ctx.db.patch(item._id, { cartId: keep._id });
      }
    }
    await ctx.db.delete(cart._id);
  }
}

/**
 * Fold every other account that shares this signed-in user's verified phone or
 * email into the current session's account. Safe to call after any sign-in:
 * it only ever matches on the caller's own verified identifiers, and calling it
 * when there is nothing to merge is a no-op.
 */
export const consolidateMyAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { merged: 0 };

    const me = await ctx.db.get(userId);
    if (!me) return { merged: 0 };

    const seen = new Map<Id<"users">, Doc<"users">>();
    if (me.phone) {
      const byPhone = await ctx.db
        .query("users")
        .withIndex("phone", (q) => q.eq("phone", me.phone))
        .collect();
      for (const user of byPhone) {
        if (user._id !== userId) seen.set(user._id, user);
      }
    }
    if (me.email) {
      const byEmail = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", me.email))
        .collect();
      for (const user of byEmail) {
        if (user._id !== userId) seen.set(user._id, user);
      }
    }

    const duplicates = Array.from(seen.values());
    if (duplicates.length === 0) return { merged: 0 };

    await mergeUsersInto(ctx, userId, duplicates);
    return { merged: duplicates.length };
  },
});
