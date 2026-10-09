/**
 * @file    src/views/partials/QuestionCard.tsx
 * @brief   Render kartu pertanyaan di board dengan status, kategori, dan pointing vote
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah waktu relatif (mis. 5 menit lalu)
 *          - Tampilkan cuplikan jawaban resmi bila sudah terjawab
 */
// Kartu menampilkan badge kategori, status Terjawab/Belum, pin, nama penanya,
// dan tombol vote. Klik isi membuka halaman detail shareable /q/[id].
import Link from "next/link";
import type { Question } from "@/models/types";
import { VoteButton } from "./VoteButton";

// Tujuan: ringkas satu pertanyaan menjadi kartu pindai-cepat dengan visual hierarchy jelas.
export function QuestionCard({ question }: { question: Question }) {
  return (
    <article
      className={`adikara-card p-4 sm:p-5 flex flex-col gap-3 transition-all ${
        question.is_pinned ? "border-red-300 bg-gradient-to-r from-red-50/40 via-white to-white" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {question.is_pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
              <span>📌</span> Disematkan
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-red-50/80 px-2.5 py-0.5 text-xs font-semibold text-gray-700 border border-red-100">
            {question.categories?.name ?? "Umum"}
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
            question.is_answered
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${question.is_answered ? "bg-emerald-500" : "bg-amber-500"}`} />
          {question.is_answered ? "Terjawab" : "Belum terjawab"}
        </span>
      </div>

      <Link
        href={`/q/${question.id}`}
        className="text-base sm:text-lg font-bold text-gray-900 leading-snug hover:text-red-700 transition-colors"
      >
        {question.isi}
      </Link>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-1">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-700">
            {question.nama_penanya.charAt(0).toUpperCase()}
          </div>
          <span className="truncate max-w-[140px] sm:max-w-none">{question.nama_penanya}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/q/${question.id}`}
            className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors px-2 py-1"
          >
            Lihat Diskusi →
          </Link>
          <VoteButton questionId={question.id} initialCount={question.vote_count} />
        </div>
      </div>
    </article>
  );
}
