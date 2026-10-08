/**
 * @file    src/lib/__tests__/rateLimit.test.ts
 * @brief   Uji rate limiter in-memory sebelum implementasi dipakai
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah kasus jendela kedaluwarsa dengan waktu palsu
 */
import { expect, it } from "vitest";
import { checkRate } from "../rateLimit";

it("memblokir setelah melewati limit", () => {
  const key = "uji-" + Math.random();
  expect(checkRate(key, 1, 60_000)).toBe(true);
  expect(checkRate(key, 1, 60_000)).toBe(false);
});

it("memisahkan limit antar key", () => {
  const a = "uji-a-" + Math.random();
  const b = "uji-b-" + Math.random();
  expect(checkRate(a, 1, 60_000)).toBe(true);
  expect(checkRate(b, 1, 60_000)).toBe(true);
});
