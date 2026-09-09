"use node";

import { createHmac, timingSafeEqual } from "crypto";

/**
 * Razorpay helpers.
 *
 * Server-side only (node runtime). Uses the official REST API directly via
 * fetch so no SDK install is required, plus the standard HMAC-SHA256
 * signature verification for checkout responses.
 */

const RAZORPAY_BASE = "https://api.razorpay.com/v1";

/** Base64url helpers matching Razorpay's credential scheme. */
function basicAuth(keyId: string, keySecret: string): string {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

/** Creates a Razorpay order. Returns the order id for the checkout modal. */
export async function createRazorpayOrder(
  amountPaise: number,
  receipt: string,
  notes?: Record<string, string>,
): Promise<string> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret)
    throw new Error("Payments are not configured on this deployment.");

  const res = await fetch(`${RAZORPAY_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: basicAuth(keyId, keySecret),
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Razorpay order failed (${res.status}): ${body.slice(0, 200)}`,
    );
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}

/** Verifies the checkout signature (order_id|payment_id HMAC-SHA256). */
export function verifyPaymentSignature(
  rzpOrderId: string,
  rzpPaymentId: string,
  keySecret: string,
  signature: string,
): boolean {
  const expected = createHmac("sha256", keySecret)
    .update(`${rzpOrderId}|${rzpPaymentId}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
