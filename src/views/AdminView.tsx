/**
 * @file    src/views/AdminView.tsx
 * @brief   Render dashboard admin: tabel moderasi + aksi resmi/pin/kategori/hapus
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah filter Belum Terjawab/per kategori/search saat waktu ada (T-18 susulan)
 *          - Tambah ringkasan angka (total, belum jawab, vote) di atas tabel
 */
// Server Component: guard isAdmin() di page memanggil ini, jadi data boleh
// dibaca langsung via Model server. Aksi memakai Server Actions (adminActions)
// agar tanpa API route tambahan; revalidatePath menyegarkan board/detail.
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

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl space-y-4 p-4">
        <h1 className="text-xl font-bold">Dashboard Admin</h1>
        <p className="text-sm text-gray-600">
          Jawab dari halaman detail (login admin otomatis berlabel ADMIN), lalu tandai resmi di sini.
        </p>
        <div className="space-y-3">
          {rows.map((row) => (
            <section key={row.id} className="space-y-2 rounded border p-3">
              <p className="font-medium">{row.isi}</p>
              <p className="text-xs text-gray-500">
                {row.nama_penanya} • {row.categories?.name} • vote {row.vote_count} •{" "}
                {row.is_answered ? "Terjawab" : "Belum"} {row.is_pinned ? "• 📌" : ""}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <a href={`/q/${row.id}`} className="underline">
                  Buka & jawab →
                </a>
                <form action={actionTogglePin.bind(null, row.id, !row.is_pinned)}>
                  <button type="submit" className="rounded border px-2 py-0.5">
                    {row.is_pinned ? "Unpin" : "Pin"}
                  </button>
                </form>
                <form action={actionToggleAnswered.bind(null, row.id, !row.is_answered)}>
                  <button type="submit" className="rounded border px-2 py-0.5">
                    {row.is_answered ? "Belum terjawab" : "Terjawab"}
                  </button>
                </form>
                <form action={actionDeleteQuestion.bind(null, row.id)}>
                  <button type="submit" className="rounded border border-red-600 px-2 py-0.5 text-red-600">
                    Hapus
                  </button>
                </form>
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const slug = String(formData.get("slug") ?? "");
                    await actionMoveCategory(row.id, slug);
                  }}
                  className="flex items-center gap-1"
                >
                  <select name="slug" defaultValue="" className="rounded border p-0.5 text-sm">
                    <option value="" disabled>
                      Pindah kategori
                    </option>
                    {CATEGORY_SLUGS.map((slug) => (
                      <option key={slug} value={slug}>
                        {slug}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="rounded border px-2 py-0.5">
                    OK
                  </button>
                </form>
              </div>
              <ReplyModeration questionId={row.id} />
            </section>
          ))}
        </div>
      </main>
    </>
  );
}

// Daftar reply per pertanyaan beserta tombol jadikan-resmi dan hapus.
// Tujuan: moderasi reply per pertanyaan tanpa pindah halaman (resmi/hapus di tempat).
async function ReplyModeration({ questionId }: { questionId: string }) {
  const replies = await listRepliesByQuestion(questionId);
  if (replies.length === 0) return null;
  return (
    <ul className="space-y-1 border-t pt-2 text-sm">
      {replies.map((reply) => (
        <li key={reply.id} className="flex items-center justify-between gap-2">
          <span className="truncate">
            {reply.is_admin ? "[ADMIN] " : ""}
            {reply.nama}: {reply.isi.slice(0, 80)}
            {reply.is_official ? " (RESMI)" : ""}
          </span>
          <span className="flex shrink-0 gap-1">
            {!reply.is_official && (
              <form action={actionMarkOfficial.bind(null, questionId, reply.id)}>
                <button type="submit" className="rounded border px-1.5 py-0.5 text-xs">
                  Resmi
                </button>
              </form>
            )}
            <form action={actionDeleteReply.bind(null, questionId, reply.id)}>
              <button type="submit" className="rounded border px-1.5 py-0.5 text-xs text-red-600">
                Hapus
              </button>
            </form>
          </span>
        </li>
      ))}
    </ul>
  );
}
