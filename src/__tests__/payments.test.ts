/**
 * Targeted tests for the payment flow logic that changed recently:
 *  - Razorpay HMAC-SHA256 signature verification (live checkout path)
 *  - Convex determinism regression: mutations must never use setTimeout
 *    (this was the exact cause of the "Can't use setTimeout in queries and
 *    mutations" server error on demoPlaceOrder)
 */
import { describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { verifyPaymentSignature } from "../convex/razor";

describe("verifyPaymentSignature (razor.ts)", () => {
  const keySecret = "test_secret_key";

  test("accepts a correctly computed signature", () => {
    const orderId = "order_NyaJdkaWpbn";
    const paymentId = "pay_Xt9bSrEe";
    const signature = createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(
      verifyPaymentSignature(orderId, paymentId, keySecret, signature),
    ).toBe(true);
  });

  test("rejects a tampered payment id", () => {
    const orderId = "order_NyaJdkaWpbn";
    const signature = createHmac("sha256", keySecret)
      .update(`${orderId}|pay_real`)
      .digest("hex");

    expect(
      verifyPaymentSignature(orderId, "pay_forged", keySecret, signature),
    ).toBe(false);
  });

  test("rejects a wrong key secret", () => {
    const orderId = "order_NyaJdkaWpbn";
    const paymentId = "pay_Xt9bSrEe";
    const signature = createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(
      verifyPaymentSignature(orderId, paymentId, "other_secret", signature),
    ).toBe(false);
  });

  test("rejects a signature of different length (timing-safe compare path)", () => {
    expect(
      verifyPaymentSignature("o", "p", keySecret, "short"),
    ).toBe(false);
  });
});

describe("Convex determinism regression (payments.ts)", () => {
  const paymentsSource = readFileSync(
    resolve(import.meta.dir, "../convex/payments.ts"),
    "utf8",
  );

  test("demoPlaceOrder no longer calls setTimeout (the original crash)", () => {
    expect(paymentsSource).not.toMatch(/\bsetTimeout\s*\(/);
  });

  test("the regression comment explaining determinism is present", () => {
    expect(paymentsSource).toMatch(/must be deterministic/);
  });

  test("every mutation/query file avoids banned timers", () => {
    // The same bug class across the whole backend — guards against a repeat.
    const banned = /\bsetTimeout\s*\(|\bsetInterval\s*\(|\bsetImmediate\s*\(/;
    for (const name of [
      "payments.ts",
      "paymentsInternal.ts",
      "paymentsActions.ts",
      "orderFinalize.ts",
      "orders.ts",
      "shop.ts",
      "studio.ts",
      "seed.ts",
      "favorites.ts",
      "cart.ts",
      "bootstrap.ts",
    ]) {
      const src = readFileSync(resolve(import.meta.dir, "../convex/", name), "utf8");
      expect(src).not.toMatch(banned);
    }
  });
});
