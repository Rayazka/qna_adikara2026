/**
 * @file    src/views/AdminView.tsx
 * @brief   Render dashboard admin: tabel moderasi + aksi resmi/pin/kategori/hapus
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah filter Belum Terjawab/per kategori/search saat waktu ada (T-18 susulan)
 *          - Tambah fitur ekspor CSV untuk laporan arsip panitia
 */
// Server Component: guard isAdmin() di page memanggil ini, jadi data boleh
// dibaca langsung via Model server. Aksi memakai Server Actions (adminActions).
import Link from "next/link";
import { listQuestions } from "@/models/question";
import { listRepliesByQuestion } from "@/models/reply";
import {
  actionDeleteQuestion,
  actionDeleteReply,
  actionMarkOfficial,
  actionMoveCategory,
  actionToggleAnswered,
  actionTogglePin,
} from "@/controllers/adminActions";
import { CATEGORY_SLUGS } from "@/models/validation";
import { Header } from "./partials/Header";

// Tujuan: beri panitia satu meja kerja untuk jawab, sorot, klasifikasikan, dan bersihkan.
export async function AdminView() {
  const rows = await listQuestions(100);
  const unansweredCount = rows.filter((r) => !r.is_answered).length;
  const pinnedCount = rows.filter((r) => r.is_pinned).length;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        {/* Admin Header & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Dashboard Moderasi Panitia
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Kelola status jawaban resmi, penyematan (pin), pindah kategori, dan moderasi konten.
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/" className="button-outline text-xs !py-1.5 !px-3">
              Lihat Board Publik
            </Link>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-3 gap-3">
          <div className="adikara-card p-3 sm:p-4 text-center">
            <span className="text-xs font-semibold text-gray-500 block">Total Pertanyaan</span>
            <span className="text-lg sm:text-2xl font-black text-gray-900">{rows.length}</span>
          </div>
          <div className="adikara-card p-3 sm:p-4 text-center">
            <span className="text-xs font-semibold text-gray-500 block">Belum Terjawab</span>
            <span className="text-lg sm:text-2xl font-black text-amber-600">{unansweredCount}</span>
          </div>
          <div className="adikara-card p-3 sm:p-4 text-center">
            <span className="text-xs font-semibold text-gray-500 block">Disematkan</span>
            <span className="text-lg sm:text-2xl font-black text-red-600">{pinnedCount}</span>
          </div>
        </div>

        {/* List Pertanyaan untuk Moderasi */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900">Daftar Pertanyaan Masuk</h2>

          {rows.length === 0 && (
            <div className="adikara-card p-8 text-center text-sm text-gray-500">
              Belum ada pertanyaan masuk dari peserta.
            </div>
          )}

          {rows.map((row) => (
            <section
              key={row.id}
              className={`adikara-card p-4 sm:p-5 space-y-3 transition-all ${
                row.is_pinned ? "border-red-200 bg-red-50/20" : ""
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-gray-700 border border-red-100">
                    {row.categories?.name ?? "Umum"}
                  </span>
                  {row.is_pinned && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">
                      Disematkan
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    Oleh: <strong className="text-gray-700">{row.nama_penanya}</strong> • {row.vote_count} vote
                  </span>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    row.is_answered
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {row.is_answered ? "Sudah Terjawab" : "Belum Terjawab"}
                </span>
              </div>

              <p className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                {row.isi}
              </p>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                <Link
                  href={`/q/${row.id}`}
                  className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white hover:bg-black transition-colors"
                >
                  Buka & Jawab
                </Link>

                <form action={actionTogglePin.bind(null, row.id, !row.is_pinned)}>
                  <button
                    type="submit"
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {row.is_pinned ? "Lepas Pin" : "Sematkan (Pin)"}
                  </button>
                </form>

                <form action={actionToggleAnswered.bind(null, row.id, !row.is_answered)}>
                  <button
                    type="submit"
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {row.is_answered ? "Tandai Belum" : "Tandai Terjawab"}
                  </button>
                </form>

                {/* Move Category Form */}
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const slug = String(formData.get("slug") ?? "");
                    if (slug) await actionMoveCategory(row.id, slug);
                  }}
                  className="flex items-center gap-1"
                >
                  <select
                    name="slug"
                    defaultValue=""
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 focus:outline-none focus:border-red-500"
                  >
                    <option value="" disabled>
                      Pindah Cabang...
                    </option>
                    {CATEGORY_SLUGS.map((slug) => (
                      <option key={slug} value={slug}>
                        {slug}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Ubah
                  </button>
                </form>

                <form action={actionDeleteQuestion.bind(null, row.id)} className="ml-auto">
                  <button
                    type="submit"
                    className="rounded-full border border-red-200 bg-red-50/50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Hapus Pertanyaan
                  </button>
                </form>
              </div>

              {/* Reply Moderation inside question */}
              <ReplyModeration questionId={row.id} />
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

// Daftar reply per pertanyaan beserta tombol jadikan-resmi dan hapus.
// Tujuan: moderasi reply per pertanyaan tanpa pindah halaman (resmi/hapus di tempat).
async function ReplyModeration({ questionId }: { questionId: string }) {
  const replies = await listRepliesByQuestion(questionId);
  if (replies.length === 0) return null;
  return (
    <div className="rounded-xl bg-gray-50/80 p-3 mt-3 border border-gray-100 space-y-2">
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
        Tanggapan ({replies.length})
      </span>
      <ul className="space-y-1.5 text-xs">
        {replies.map((reply) => (
          <li
            key={reply.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-white p-2 rounded-lg border border-gray-100"
          >
            <div className="truncate">
              {reply.is_admin && (
                <span className="rounded bg-red-600 px-1 py-0.2 text-[9px] font-bold text-white mr-1">
                  PANITIA
                </span>
              )}
              <strong className="text-gray-900">{reply.nama}</strong>:{" "}
              <span className="text-gray-600">{reply.isi}</span>
              {reply.is_official && (
                <span className="ml-1 text-[10px] font-bold text-emerald-600">
                  (RESMI)
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
              {!reply.is_official && (
                <form action={actionMarkOfficial.bind(null, questionId, reply.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    Jadikan Resmi
                  </button>
                </form>
              )}
              <form action={actionDeleteReply.bind(null, questionId, reply.id)}>
                <button
                  type="submit"
                  className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  Hapus
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
