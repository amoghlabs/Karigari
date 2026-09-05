import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Seeds/replaces the catalog content (makers + products) with the current
 * seed. Safe to call from the client on mount — seedCatalog is idempotent
 * and never touches user-created studios.
 */
export const ensureSeeded = mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(internal.seed.seedCatalog, {});
    return true;
  },
});
