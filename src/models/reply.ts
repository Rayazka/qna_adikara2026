/**
 * @file    src/models/reply.ts
 * @brief   Query tabel replies (list flat + tulis + tandai resmi + hapus)
 * @author  ray
 * @created 2026-10-08
 * @todo    - Bungkus setOfficial dalam RPC transaksional tunggal
 *          - Tambah retensi hapus balasan lama pasca-event bila perlu
 */
// Reply selalu flat kronologis tanpa vote. Penetapan jawaban resmi dilakukan
// berurutan (unset lama → set baru → tandai terjawab) karena supabase-js
// tidak menyediakan transaksi multi-statement di MVP ini.
import { supabaseServer } from "@/lib/supabaseServer";
import { setAnswered } from "./question";
import type { Reply } from "./types";

// Tujuan: muat diskusi flat kronologis agar jawaban resmi mudah dipisah di atas.
export async function listRepliesByQuestion(questionId: string): Promise<Reply[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("replies")
    .select("id,question_id,nama,isi,is_admin,is_official,created_at")
    .eq("question_id", questionId)
    .order("created_at", { ascending: true })
    .returns<Reply[]>();
  if (error) throw new Error(`Gagal memuat balasan: ${error.message}`);
  return data;
}

// Tujuan: simpan tanggapan peserta/admin langsung tampil tanpa antre moderasi.
export async function createReply(input: {
  questionId: string;
  nama: string;
  isi: string;
  isAdmin: boolean;
}): Promise<string> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("replies")
    .insert({
      question_id: input.questionId,
      nama: input.nama.trim(),
      isi: input.isi.trim(),
      is_admin: input.isAdmin,
    })
    .select("id")
    .single<{ id: string }>();
  if (error) throw new Error(`Gagal menyimpan balasan: ${error.message}`);
  return data.id;
}

// Hanya satu jawaban resmi per pertanyaan: yang lama otomatis turun jadi reply biasa.
// Tujuan: tetapkan satu jawaban resmi sekaligus tandai pertanyaan Terjawab.
export async function setOfficial(questionId: string, replyId: string): Promise<void> {
  const supabase = await supabaseServer();
  const { error: unsetError } = await supabase
    .from("replies")
    .update({ is_official: false })
    .eq("question_id", questionId)
    .eq("is_official", true);
  if (unsetError) throw new Error(`Gagal mengganti jawaban resmi: ${unsetError.message}`);
  const { error: setError } = await supabase
    .from("replies")
    .update({ is_official: true })
    .eq("id", replyId);
  if (setError) throw new Error(`Gagal menandai jawaban resmi: ${setError.message}`);
  await setAnswered(questionId, true);
}

// Tujuan: hapus reply spam manual tanpa mengganggu pertanyaan dan reply lain.
export async function removeReply(id: string): Promise<void> {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("replies").delete().eq("id", id);
  if (error) throw new Error(`Gagal menghapus balasan: ${error.message}`);
}
