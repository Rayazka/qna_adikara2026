/**
 * @file    src/controllers/adminController.ts
 * @brief   Orkestrasi aksi admin (resmi, pin, kategori, hapus) dengan guard login
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Setiap fungsi memeriksa isAdmin() dulu agar pemanggil (Server Action) tidak perlu
// mengulang guard. Error "FORBIDDEN" dipetakan menjadi 403 oleh pemanggil.
import { isAdmin } from "@/lib/supabaseServer";
import { findCategoryBySlug } from "@/models/category";
import { removeQuestion, setAnswered, setCategory, setPin } from "@/models/question";
import { removeReply, setOfficial } from "@/models/reply";

async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("FORBIDDEN");
}

export async function markOfficial(questionId: string, replyId: string): Promise<void> {
  await requireAdmin();
  await setOfficial(questionId, replyId);
}

export async function togglePin(questionId: string, pinned: boolean): Promise<void> {
  await requireAdmin();
  await setPin(questionId, pinned);
}

export async function toggleAnswered(questionId: string, answered: boolean): Promise<void> {
  await requireAdmin();
  await setAnswered(questionId, answered);
}

export async function moveCategory(questionId: string, slug: string): Promise<void> {
  await requireAdmin();
  const category = await findCategoryBySlug(slug);
  if (!category) throw new Error("Kategori tidak valid");
  await setCategory(questionId, category.id);
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await requireAdmin();
  await removeQuestion(questionId);
}

export async function deleteReply(replyId: string): Promise<void> {
  await requireAdmin();
  await removeReply(replyId);
}
