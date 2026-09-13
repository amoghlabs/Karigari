/**
 * Minimal ambient types for the `bun:test` module, so the app-wide tsc
 * typecheck passes without adding @types/bun. Tests run with `bun test`.
 *
 * Intentionally a script file (no imports/exports): ambient module
 * declarations and global interface augmentation only work in scripts.
 */
declare module "bun:test" {
  interface Matchers<T> {
    toBe(expected: T): void;
    toEqual(expected: unknown): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeDefined(): void;
    toBeUndefined(): void;
    toBeGreaterThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeLessThan(expected: number): void;
    toBeLessThanOrEqual(expected: number): void;
    toContain(expected: unknown): void;
    toMatch(expected: string | RegExp): void;
    toThrow(expected?: string | RegExp): void;
    toHaveLength(expected: number): void;
    readonly not: Matchers<T>;
  }
  export function expect<T>(actual: T, message?: string): Matchers<T>;
  export function describe(name: string, fn: () => void): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
}

/** Bun-specific runtime globals. */
interface ImportMeta {
  dir: string;
}
