/**
 * @file    src/models/validation.ts
 * @brief   Validasi aturan domain form anonim sebelum data menyentuh database
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Dipakai Controller (server) dan form View (client) agar pesan error konsisten
// berbahasa Indonesia. Mengembalikan string error atau null jika valid.
export const CATEGORY_SLUGS = [
  "umum",
  "inovasi",
  "entrepreneur",
  "data-mining",
  "competitive-programming",
  "cybersecurity",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export function isCategorySlug(value: string): value is CategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(value);
}

export function validateNama(nama: string): string | null {
  const value = nama.trim();
  if (value.length < 2) return "Nama minimal 2 karakter";
  if (value.length > 50) return "Nama maksimal 50 karakter";
  return null;
}

export function validateIsi(isi: string, minLength = 10): string | null {
  const value = isi.trim();
  if (value.length < minLength) return `Isi minimal ${minLength} karakter`;
  if (value.length > 1000) return "Isi maksimal 1000 karakter";
  return null;
}
