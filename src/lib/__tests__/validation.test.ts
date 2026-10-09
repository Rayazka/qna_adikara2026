/**
 * @file    src/lib/__tests__/validation.test.ts
 * @brief   Uji aturan validasi form anonim sebelum implementasi dipakai
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah kasus batas tepat (2, 50, 1000 karakter)
 */
import { describe, expect, it } from "vitest";
import { validateIsi, validateNama } from "../../models/validation";

describe("validateNama", () => {
  it("menerima nama kosong (akan default ke Peserta)", () => {
    expect(validateNama("")).toBeNull();
    expect(validateNama(undefined)).toBeNull();
  });

  it("menolak nama jika diisi tapi terlalu pendek", () => {
    expect(validateNama("A")).toBeTruthy();
  });

  it("menerima nama normal", () => {
    expect(validateNama("Budi")).toBeNull();
  });

  it("menolak nama kepanjangan", () => {
    expect(validateNama("x".repeat(51))).toBeTruthy();
  });
});

describe("validateIsi", () => {
  it("menolak isi terlalu pendek", () => {
    expect(validateIsi("pendek")).toBeTruthy();
  });

  it("menerima isi normal", () => {
    expect(validateIsi("Apakah final boleh membawa laptop sendiri?")).toBeNull();
  });
});
