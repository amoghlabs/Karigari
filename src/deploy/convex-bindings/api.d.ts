/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as aiStory from "../aiStory.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as bootstrap from "../bootstrap.js";
import type * as cart from "../cart.js";
import type * as favorites from "../favorites.js";
import type * as http from "../http.js";
import type * as orderFinalize from "../orderFinalize.js";
import type * as orders from "../orders.js";
import type * as payments from "../payments.js";
import type * as paymentsActions from "../paymentsActions.js";
import type * as paymentsInternal from "../paymentsInternal.js";
import type * as phoneOtp from "../phoneOtp.js";
import type * as razor from "../razor.js";
import type * as seed from "../seed.js";
import type * as shop from "../shop.js";
import type * as studio from "../studio.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  aiStory: typeof aiStory;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  bootstrap: typeof bootstrap;
  cart: typeof cart;
  favorites: typeof favorites;
  http: typeof http;
  orderFinalize: typeof orderFinalize;
  orders: typeof orders;
  payments: typeof payments;
  paymentsActions: typeof paymentsActions;
  paymentsInternal: typeof paymentsInternal;
  phoneOtp: typeof phoneOtp;
  razor: typeof razor;
  seed: typeof seed;
  shop: typeof shop;
  studio: typeof studio;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
