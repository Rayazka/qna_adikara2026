/**
 * @file    src/controllers/replyController.ts
 * @brief   Orkestrasi penulisan reply flat dengan badge admin otomatis
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah saring tautan/spam pola berulang sebelum simpan
 *          - Pisahkan limit reply admin dan peserta bila perlu
 */
// Penulis yang sedang login sebagai admin otomatis mendapat is_admin=true,
// sehingga View bisa memberi badge ADMIN tanpa input tambahan dari form.
import { checkRate } from "@/lib/rateLimit";
import { isAdmin } from "@/lib/supabaseServer";
import { createReply } from "@/models/reply";
import { validateIsi, validateNama } from "@/models/validation";

export interface ReplyInput {
  questionId: string;
  nama?: string;
  isi: string;
  ip: string;
}

// Tujuan: jadikan satu pintu penulisan reply termasuk penentuan badge admin otomatis.
export async function createReplyFlow(input: ReplyInput): Promise<string> {
  const namaError = validateNama(input.nama);
  if (namaError) throw new Error(namaError);
  // Reply tanggapan boleh singkat: minimal 2 karakter (beda dari pertanyaan).
  const isiError = validateIsi(input.isi, 2);
  if (isiError) throw new Error(isiError);
  if (!input.questionId) throw new Error("question_id wajib diisi");
  if (!checkRate(`reply:${input.ip}`, 3, 60_000)) {
    throw new Error("Terlalu cepat, tunggu sebentar");
  }
  const admin = await isAdmin();
  const namaPenulis = input.nama?.trim() || (admin ? "Panitia ADIKARA" : "Peserta");
  return createReply({
    questionId: input.questionId,
    nama: namaPenulis,
    isi: input.isi,
    isAdmin: admin,
  });
}
