/**
 * @file    src/views/partials/QuestionCard.tsx
 * @brief   Render kartu ringkas pertanyaan di board dengan status dan vote
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tampilkan cuplikan jawaban resmi 1 baris di kartu
 *          - Tambah waktu relatif (mis. 5 mnt lalu) ganti tanggal mentah
 */
// Kartu menampilkan badge kategori, status Terjawab/Belum, pin, nama penanya,
// dan tombol vote. Klik isi membuka halaman detail shareable /q/[id].
import Link from "next/link";
import type { Question } from "@/models/types";
import { VoteButton } from "./VoteButton";

// Tujuan: ringkas satu pertanyaan menjadi kartu pindai-cepat (status, kategori, vote).
export function QuestionCard({ question }: { question: Question }) {
  return (
    <article className="rounded border p-3" style={{ backgroundColor: "var(--background)" }}>
      <div className="flex items-center gap-2 text-xs">
        {question.is_pinned && <span aria-label="Disematkan admin">📌</span>}
        <span
          className="rounded px-2 py-0.5"
          style={{ backgroundColor: "var(--pattern-pink)", color: "var(--foreground)" }}
        >
          {question.categories?.name ?? "Umum"}
        </span>
        <span style={{ color: question.is_answered ? "var(--adikara-dark-red)" : "#b45309" }}>
          {question.is_answered ? "Terjawab" : "Belum terjawab"}
        </span>
      </div>
      <Link href={`/q/${question.id}`} className="mt-1 block font-medium">
        {question.isi}
      </Link>
      <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
        <span>{question.nama_penanya}</span>
        <VoteButton questionId={question.id} initialCount={question.vote_count} />
      </div>
    </article>
  );
}
