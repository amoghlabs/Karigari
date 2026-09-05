import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Seeds the demo catalog (makers + products) if the makers table is empty.
 * Safe to call from the client on mount — it is a no-op once data exists.
 */
export const ensureSeeded = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("makers").first();
    if (existing !== null) return false;
    await ctx.runMutation(internal.seed.seedCatalog, {});
    return true;
  },
});
