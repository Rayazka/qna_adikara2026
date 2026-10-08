/**
 * @file    src/controllers/adminController.ts
 * @brief   Orkestrasi aksi admin (resmi, pin, kategori, hapus) dengan guard login
 * @author  ray
 * @created 2026-10-08
 * @todo    - Catat jejak audit tiap aksi admin beserta pelakunya
 *          - Tambah peran per cabang bila admin bertambah banyak
 */
// Setiap fungsi memeriksa isAdmin() dulu agar pemanggil (Server Action) tidak perlu
// mengulang guard. Error "FORBIDDEN" dipetakan menjadi 403 oleh pemanggil.
import { isAdmin } from "@/lib/supabaseServer";
import { findCategoryBySlug } from "@/models/category";
import { removeQuestion, setAnswered, setCategory, setPin } from "@/models/question";
import { removeReply, setOfficial } from "@/models/reply";

// Tujuan: gagalkan cepat aksi non-admin sebelum query apa pun menyentuh DB.
async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("FORBIDDEN");
}

// Tujuan: promosikan satu reply menjadi jawaban resmi yang disorot di detail.
export async function markOfficial(questionId: string, replyId: string): Promise<void> {
  await requireAdmin();
  await setOfficial(questionId, replyId);
}

// Tujuan: sematkan/lepaskan sorotan agar info kritis event selalu terlihat.
export async function togglePin(questionId: string, pinned: boolean): Promise<void> {
  await requireAdmin();
  await setPin(questionId, pinned);
}

// Tujuan: perbarui status keterjawaban manual saat jawaban tidak lewat flag resmi.
export async function toggleAnswered(questionId: string, answered: boolean): Promise<void> {
  await requireAdmin();
  await setAnswered(questionId, answered);
}

// Tujuan: pindahkan pertanyaan ke cabang benar berdasarkan slug pilihan admin.
export async function moveCategory(questionId: string, slug: string): Promise<void> {
  await requireAdmin();
  const category = await findCategoryBySlug(slug);
  if (!category) throw new Error("Kategori tidak valid");
  await setCategory(questionId, category.id);
}

// Tujuan: bersihkan pertanyaan spam beserta turunannya dalam satu aksi admin.
export async function deleteQuestion(questionId: string): Promise<void> {
  await requireAdmin();
  await removeQuestion(questionId);
}

// Tujuan: bersihkan reply spam tanpa menghapus diskusi lainnya.
export async function deleteReply(replyId: string): Promise<void> {
  await requireAdmin();
  await removeReply(replyId);
}
