/**
 * @file    src/models/question.ts
 * @brief   Query tabel questions (CRUD + pin + jawab + pindah kategori)
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Satu-satunya tempat yang boleh menyentuh tabel questions. Guard admin (isAdmin)
// dan RLS ada di DB; fungsi ini melempar Error berbahasa Indonesia agar controller
// memetakan ke status HTTP yang tepat.
import { supabaseServer } from "@/lib/supabaseServer";
import type { Question } from "./types";

const SELECT = "id,nama_penanya,isi,category_id,is_pinned,is_answered,vote_count,created_at,categories(name,slug)";

export async function listQuestions(limit = 100): Promise<Question[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("questions")
    .select(SELECT)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<Question[]>();
  if (error) throw new Error(`Gagal memuat pertanyaan: ${error.message}`);
  return data;
}

export async function getQuestionDetail(id: string): Promise<Question | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("questions")
    .select(SELECT)
    .eq("id", id)
    .single<Question>();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Gagal memuat detail: ${error.message}`);
  }
  return data;
}

export async function createQuestion(input: {
  nama: string;
  isi: string;
  categoryId: string;
}): Promise<string> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("questions")
    .insert({
      nama_penanya: input.nama.trim(),
      isi: input.isi.trim(),
      category_id: input.categoryId,
    })
    .select("id")
    .single<{ id: string }>();
  if (error) throw new Error(`Gagal menyimpan pertanyaan: ${error.message}`);
  return data.id;
}

export async function setPin(id: string, pinned: boolean): Promise<void> {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("questions")
    .update({ is_pinned: pinned })
    .eq("id", id);
  if (error) throw new Error(`Gagal mengubah pin: ${error.message}`);
}

export async function setAnswered(id: string, answered: boolean): Promise<void> {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("questions")
    .update({ is_answered: answered })
    .eq("id", id);
  if (error) throw new Error(`Gagal mengubah status: ${error.message}`);
}

export async function setCategory(id: string, categoryId: string): Promise<void> {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("questions")
    .update({ category_id: categoryId })
    .eq("id", id);
  if (error) throw new Error(`Gagal memindah kategori: ${error.message}`);
}

// Hapus question ikut menghapus replies+votes via ON DELETE CASCADE di DB.
export async function removeQuestion(id: string): Promise<void> {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw new Error(`Gagal menghapus pertanyaan: ${error.message}`);
}
