"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { createRazorpayOrder, verifyPaymentSignature } from "./razor";

/**
 * Live Razorpay checkout actions (node runtime: fetch + crypto).
 * Keys stay server-side; the browser only ever receives the public key id.
 */

/**
 * Creates a Razorpay order for the current cart and records a pending
 * checkout session. Returns the values the Razorpay checkout modal needs.
 */
export const createRazorpayOrderAction = action({
  args: {
    fullName: v.string(),
    address: v.string(),
  },
  handler: async (ctx, { fullName, address }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to check out.");

    const name = fullName.trim();
    const addr = address.trim();
    if (name.length < 2) throw new Error("Please add the recipient name.");
    if (addr.length < 8) throw new Error("Please add a shipping address.");

    const { lines, subtotal, count } = await ctx.runQuery(
      internal.paymentsInternal.getPayableCart,
      {},
    );
    const amountPaise = subtotal * 100;
    const receipt = `kg_${Date.now()}_${Math.floor(Math.random() * 1e5)}`;

    const rzpOrderId = await createRazorpayOrder(amountPaise, receipt, {
      buyer: name,
      items: String(count),
    });

    await ctx.runMutation(internal.paymentsInternal.recordSession, {
      userId,
      rzpOrderId,
      amount: subtotal,
      currency: "INR",
      fullName: name,
      address: addr,
      lines,
    });

    return {
      rzpOrderId,
      amountPaise,
      keyId: process.env.RAZORPAY_KEY_ID as string,
      count,
    };
  },
});

/**
 * Verifies the Razorpay checkout signature server-side and places the real
 * order atomically. Returns the same shape as the demo checkout.
 */
export const verifyRazorpayPayment = action({
  args: {
    rzpOrderId: v.string(),
    rzpPaymentId: v.string(),
    rzpSignature: v.string(),
  },
  handler: async (ctx, { rzpOrderId, rzpPaymentId, rzpSignature }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to check out.");

    const session = await ctx.runQuery(
      internal.paymentsInternal.getSessionForVerify,
      { rzpOrderId },
    );
    if (!session)
      throw new Error("Checkout session not found — please start again.");

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Payments are not configured.");
    const valid = verifyPaymentSignature(
      rzpOrderId,
      rzpPaymentId,
      secret,
      rzpSignature,
    );
    if (!valid) throw new Error("Payment verification failed.");

    const result = await ctx.runMutation(
      internal.paymentsInternal.placeVerifiedOrder,
      { rzpOrderId, rzpPaymentId },
    );
    return result;
  },
});
