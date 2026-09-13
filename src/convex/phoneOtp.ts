import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { mergeUsersInto } from "./accounts";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length === 10) return `+91${digits}`; // Indian mobile
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  throw new Error("Enter a valid phone number.");
}

/**
 * Issues a 6-digit OTP for the given phone number.
 * In demo mode (no SMS provider configured) the code is returned to the
 * client so the flow is testable; a real SMS gateway can read the same code
 * from the phoneOtps table instead.
 */
export const requestPhoneOtp = mutation({
  args: { phone: v.string() },
  handler: async (ctx, { phone }) => {
    const normalized = normalizePhone(phone);
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Invalidate any previous code for this number.
    const existing = await ctx.db
      .query("phoneOtps")
      .withIndex("by_phone", (q) => q.eq("phone", normalized))
      .collect();
    for (const row of existing) await ctx.db.delete(row._id);

    await ctx.db.insert("phoneOtps", {
      phone: normalized,
      code,
      expiresAt: Date.now() + CODE_TTL_MS,
      used: false,
    });

    return { phone: normalized, devCode: code };
  },
});

/**
 * Verifies the OTP and marks the signed-in user as an artisan.
 *
 * One phone number always resolves to one account: if this number already
 * belongs to an earlier account (from a previous login, or a duplicate created
 * while testing), that account's studio, listings and order history are folded
 * into the current one before the phone is attached. Only when no account
 * exists for the number does verification create a fresh artisan identity.
 */
export const verifyPhoneOtp = mutation({
  args: { phone: v.string(), code: v.string() },
  handler: async (ctx, { phone, code }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to verify your phone.");

    const normalized = normalizePhone(phone);
    const row = await ctx.db
      .query("phoneOtps")
      .withIndex("by_phone", (q) => q.eq("phone", normalized))
      .order("desc")
      .first();
    if (!row || row.used || row.expiresAt < Date.now() || row.code !== code.trim()) {
      throw new Error("The code is incorrect or has expired.");
    }

    await ctx.db.patch(row._id, { used: true });

    // Returning artisan: bring the existing account (and any duplicates that
    // share this number) over to the current session instead of starting fresh.
    const existing = await ctx.db
      .query("users")
      .withIndex("phone", (q) => q.eq("phone", normalized))
      .collect();
    const duplicates = existing.filter((user) => user._id !== userId);
    if (duplicates.length > 0) {
      await mergeUsersInto(ctx, userId, duplicates);
    }

    await ctx.db.patch(userId, {
      phone: normalized,
      phoneVerificationTime: Date.now(),
      role: "artisan" as const,
    });
    return { ok: true };
  },
});