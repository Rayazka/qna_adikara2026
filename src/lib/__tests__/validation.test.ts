// Uji aturan validasi form anonim (nama + isi) sebelum implementasi ada.
import { describe, expect, it } from "vitest";
import { validateIsi, validateNama } from "../../models/validation";

describe("validateNama", () => {
  it("menolak nama terlalu pendek", () => {
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
