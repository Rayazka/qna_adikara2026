/**
 * @file    src/views/partials/QuestionCard.tsx
 * @brief   Render kartu pertanyaan di board dengan pratinjau 1 jawaban dan tombol diskusi
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah waktu relatif (mis. 5 menit lalu)
 *          - Tambah indikator jumlah total tanggapan
 */
// Kartu menampilkan badge kategori, status Terjawab/Belum, pin, pratinjau 1 jawaban,
// dan tombol vote + tombol Lihat Diskusi ber-background.
import Link from "next/link";
import type { Question, Reply } from "@/models/types";
import { VoteButton } from "./VoteButton";

// Tujuan: cari 1 jawaban paling relevan (resmi -> admin -> umum) untuk dipratinjau di kartu.
function getPreviewReply(replies?: Reply[] | null): Reply | undefined {
  if (!replies || replies.length === 0) return undefined;
  const official = replies.find((r) => r.is_official);
  if (official) return official;
  const admin = replies.find((r) => r.is_admin);
  if (admin) return admin;
  return replies[0];
}

// Tujuan: ringkas satu pertanyaan beserta 1 jawaban pratinjau agar peserta cepat mendapat info.
export function QuestionCard({ question }: { question: Question }) {
  const preview = getPreviewReply(question.replies);
  const totalReplies = question.replies?.length ?? 0;

  return (
    <article
      className={`adikara-card p-4 sm:p-5 flex flex-col gap-3.5 transition-all ${
        question.is_pinned ? "border-red-300 bg-gradient-to-r from-red-50/40 via-white to-white" : ""
      }`}
    >
      {/* Top Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {question.is_pinned && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
              Disematkan
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-red-50/80 px-2.5 py-0.5 text-xs font-semibold text-gray-700 border border-red-100">
            {question.categories?.name ?? "Umum"}
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
            question.is_answered
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${question.is_answered ? "bg-emerald-500" : "bg-amber-500"}`} />
          {question.is_answered ? "Terjawab" : "Belum terjawab"}
        </span>
      </div>

      {/* Question Headline */}
      <Link
        href={`/q/${question.id}`}
        className="text-base sm:text-lg font-bold text-gray-900 leading-snug hover:text-red-700 transition-colors"
      >
        {question.isi}
      </Link>

      {/* Preview 1 Jawaban (jika ada) */}
      {preview && (
        <div className="rounded-xl border border-red-100 bg-red-50/30 p-3 space-y-1 text-xs">
          <div className="flex items-center justify-between gap-2 font-bold text-gray-700">
            <span className={preview.is_official ? "text-red-700 font-extrabold uppercase" : preview.is_admin ? "text-red-600 font-bold uppercase" : "text-gray-600 uppercase"}>
              {preview.is_official ? "Jawaban Resmi Panitia" : preview.is_admin ? "Tanggapan Panitia" : "Tanggapan Terkini"}
            </span>
            <span className="text-[10px] font-normal text-gray-400">
              {preview.nama}
            </span>
          </div>
          <p className="text-gray-800 line-clamp-2 leading-relaxed font-normal">
            {preview.isi}
          </p>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-0.5">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-700">
            {question.nama_penanya.charAt(0).toUpperCase()}
          </div>
          <span className="truncate max-w-[120px] sm:max-w-none text-gray-600 font-semibold">{question.nama_penanya}</span>
          {totalReplies > 0 && (
            <span className="text-gray-400 font-normal">
              • {totalReplies} tanggapan
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <VoteButton questionId={question.id} initialCount={question.vote_count} />
          <Link
            href={`/q/${question.id}`}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gray-900 hover:bg-black transition-all shadow-xs"
          >
            Lihat Diskusi
          </Link>
        </div>
      </div>
    </article>
  );
}
