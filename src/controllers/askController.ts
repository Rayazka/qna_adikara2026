/**
 * @file    src/controllers/askController.ts
 * @brief   Orkestrasi pembuatan pertanyaan: validasi, rate-limit, simpan via Model
 * @author  ray
 * @created 2026-10-08
 * @todo    - Aktifkan verifikasi Turnstile saat site key tersedia (T-20)
 *          - Catat metrik pertanyaan per kategori untuk laporan panitia
 */
// Controller tidak render JSX dan tidak query DB langsung; semua tulis lewat Model.
// Dipakai Route Handler POST /api/ask. Turnstile best-effort: dilewati jika secret kosong.
import { checkRate } from "@/lib/rateLimit";
import { findCategoryBySlug } from "@/models/category";
import { createQuestion } from "@/models/question";
import { isCategorySlug, validateIsi, validateNama } from "@/models/validation";

export interface AskInput {
  nama?: string;
  isi: string;
  categorySlug: string;
  ip: string;
}

// Tujuan: jadikan satu pintu pembuatan pertanyaan agar urutan validasi→limit→simpan konsisten.
export async function createQuestionFlow(input: AskInput): Promise<string> {
  const namaError = validateNama(input.nama);
  if (namaError) throw new Error(namaError);
  const isiError = validateIsi(input.isi);
  if (isiError) throw new Error(isiError);
  if (!isCategorySlug(input.categorySlug)) throw new Error("Kategori tidak valid");
  if (!checkRate(`ask:${input.ip}`, 1, 60_000)) {
    throw new Error("Terlalu cepat, tunggu 1 menit");
  }
  const category = await findCategoryBySlug(input.categorySlug);
  if (!category) throw new Error("Kategori tidak valid");
  const namaPenanya = input.nama?.trim() || "Peserta";
  return createQuestion({ nama: namaPenanya, isi: input.isi, categoryId: category.id });
}
