/**
 * @file    src/models/question.ts
 * @brief   Query tabel questions (CRUD + pin + jawab + pindah kategori)
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah paginasi cursor untuk arsip pasca-event
 *          - Tambah pencarian full-text saat daftar melebihi 1000 baris
 */
// Satu-satunya tempat yang boleh menyentuh tabel questions. Guard admin (isAdmin)
// dan RLS ada di DB; fungsi ini melempar Error berbahasa Indonesia agar controller
// memetakan ke status HTTP yang tepat.
import { supabaseServer } from "@/lib/supabaseServer";
import type { Question } from "./types";

const SELECT = "id,nama_penanya,isi,category_id,is_pinned,is_answered,vote_count,created_at,categories(name,slug),replies(id,question_id,nama,isi,is_admin,is_official,created_at)";

// Tujuan: ambil papan terbaru (pin dulu) dalam 1 query join agar board render sekali jalan.
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

// Tujuan: muat satu pertanyaan untuk halaman shareable; null berarti ID salah → tampilkan 404.
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

// Tujuan: simpan pertanyaan tervalidasi dan kembalikan id untuk redirect/detail langsung.
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

// Tujuan: naikkan pertanyaan penting ke atas board apa pun mode sort-nya.
export async function setPin(id: string, pinned: boolean): Promise<void> {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("questions")
    .update({ is_pinned: pinned })
    .eq("id", id);
  if (error) throw new Error(`Gagal mengubah pin: ${error.message}`);
}

// Tujuan: ubah badge Terjawab/Belum agar peserta tahu mana yang sudah ada jawaban resmi.
export async function setAnswered(id: string, answered: boolean): Promise<void> {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("questions")
    .update({ is_answered: answered })
    .eq("id", id);
  if (error) throw new Error(`Gagal mengubah status: ${error.message}`);
}

// Tujuan: koreksi pertanyaan salah kamar ke cabang lomba yang benar tanpa hapus data.
export async function setCategory(id: string, categoryId: string): Promise<void> {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("questions")
    .update({ category_id: categoryId })
    .eq("id", id);
  if (error) throw new Error(`Gagal memindah kategori: ${error.message}`);
}

// Hapus question ikut menghapus replies+votes via ON DELETE CASCADE di DB.
// Tujuan: hapus spam beserta seluruh reply+vote-nya lewat cascade DB sekaligus.
export async function removeQuestion(id: string): Promise<void> {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw new Error(`Gagal menghapus pertanyaan: ${error.message}`);
}
