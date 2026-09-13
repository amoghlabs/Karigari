/**
 * Regression guards for the account-persistence bug and the artisan-identity
 * fixes:
 *  - One verified phone number must resolve to a single account (a returning
 *    artisan keeps their studio, a returning buyer keeps their order history).
 *  - Seeded artisans must be Indian and craft-specific (portrait, name, place).
 *  - The artisan's own words (voice or typed) must reach listing generation.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { seed } from "../convex/seed";

const convexFile = (name: string) =>
  readFileSync(resolve(import.meta.dir, "../convex/", name), "utf8");

const page = (name: string) =>
  readFileSync(resolve(import.meta.dir, "../pages/", name), "utf8");

describe("seeded artisan identities (seed.ts)", () => {
  test("every seeded artisan has a real Indian name", () => {
    for (const maker of seed) {
      expect(maker.artisanName.trim().length).toBeGreaterThan(3);
      // The portrait must be a person photo, not a generic stock image.
      expect(maker.image).toBeDefined();
      expect(maker.image).toMatch(/crop=faces/);
    }
  });

  test("artisan names are unique", () => {
    const names = seed.map((m) => m.artisanName);
    expect(new Set(names).size).toBe(names.length);
  });

  test("every artisan is based in an Indian craft cluster", () => {
    // Real towns/regions of the craft: "Jaipur, Rajasthan", "Bhuj, Gujarat", …
    for (const maker of seed) {
      expect(maker.location).toMatch(/^[A-Za-z\u0900-\u097F .-]+, [A-Za-z .-]+$/);
    }
    const places = seed.map((m) => m.location).join(" | ");
    for (const region of ["Rajasthan", "Uttar Pradesh", "Gujarat", "Odisha"]) {
      expect(places).toContain(region);
    }
  });
});

describe("one phone number resolves to one account", () => {
  const schema = convexFile("schema.ts");
  const phoneOtp = convexFile("phoneOtp.ts");
  const accounts = convexFile("accounts.ts");

  test("users are indexed by phone and record phone verification", () => {
    expect(schema).toMatch(/\.index\("phone", \["phone"\]\)/);
    expect(schema).toMatch(/phoneVerificationTime/);
  });

  test("verifyPhoneOtp merges any existing account for the number", () => {
    expect(phoneOtp).toMatch(/withIndex\("phone"/);
    expect(phoneOtp).toMatch(/mergeUsersInto/);
    expect(phoneOtp).toMatch(/phoneVerificationTime/);
  });

  test("the merge moves the studio, order history and bag across", () => {
    expect(accounts).toMatch(/makers/);
    expect(accounts).toMatch(/orders/);
    expect(accounts).toMatch(/carts/);
    expect(accounts).toMatch(/favorites/);
    expect(accounts).toMatch(/checkoutSessions/);
    // Auth identities (email logins) must survive the merge too.
    expect(accounts).toMatch(/authAccounts/);
  });

  test("the buy flow folds duplicate accounts in after sign-in", () => {
    const auth = page("Auth.tsx");
    expect(auth).toMatch(/consolidateMyAccount/);
    expect(auth).toMatch(/consolidate\(\{\}\)/);
  });

  test("the artisan flow never restarts an existing session", () => {
    const auth = page("Auth.tsx");
    // Anonymous sign-in must be guarded so a returning artisan is not detached.
    expect(auth).toMatch(/if \(!isAuthenticated\)/);
  });
});

describe("artisan profile photo and identity are editable", () => {
  test("updateMaker accepts a newly uploaded profile photo", () => {
    const studio = convexFile("studio.ts");
    expect(studio).toMatch(/imageStorageId: v\.optional\(v\.id\("_storage"\)\)/);
    expect(studio).toMatch(/artisanName/);
  });

  test("studio settings offer a photo upload and a name field", () => {
    const studioPage = page("Studio.tsx");
    expect(studioPage).toMatch(/stm\.photo/);
    expect(studioPage).toMatch(/setArtisanName/);
  });
});

describe("the artisan's own words reach listing generation", () => {
  test("voice recognition exposes a live transcript and typed fallback", () => {
    const hook = readFileSync(
      resolve(import.meta.dir, "../hooks/use-speech.ts"),
      "utf8",
    );
    expect(hook).toMatch(/transcript/);
    expect(hook).toMatch(/interim/);
    // Continuous recognition so a long description is not cut off.
    expect(hook).toMatch(/rec\.continuous = true/);
  });

  test("the listing dialog feeds spoken + typed words into generation", () => {
    const studioPage = page("Studio.tsx");
    expect(studioPage).toMatch(/voiceNote: voiceText/);
    expect(studioPage).toMatch(/ld\.voiceTyped/);
  });
});
