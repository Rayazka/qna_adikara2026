/**
 * @file    src/views/partials/ReplyList.tsx
 * @brief   Render daftar reply flat kronologis dengan badge peran penulis
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah paginasi saat reply puluhan agar halaman ringan
 *          - Sembunyikan reply terhapus halus bila moderasi lunak dipakai
 */
// Flat 1 level tanpa vote dan tanpa balasan-ke-balasan (keputusan MVP).
// Badge ADMIN merah, Peserta netral agar jawaban panitia mudah dikenali.
import type { Reply } from "@/models/types";

// Tujuan: tampilkan diskusi apa adanya dengan peran jelas agar info admin tidak tertukar.
export function ReplyList({ replies }: { replies: Reply[] }) {
  if (replies.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
        <p className="text-sm font-medium text-gray-500">
          Belum ada tanggapan lain. Berikan tanggapanmu di bawah!
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {replies.map((reply) => (
        <div
          key={reply.id}
          className={`rounded-2xl border p-4 transition-all ${
            reply.is_admin
              ? "border-red-200 bg-red-50/30"
              : "border-gray-100 bg-white shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                  reply.is_admin ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {reply.nama.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-gray-900">{reply.nama}</span>
            </div>

            {reply.is_admin ? (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white"
                style={{ backgroundColor: "var(--adikara-red)" }}
              >
                PANITIA
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                Peserta
              </span>
            )}
          </div>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{reply.isi}</p>
        </div>
      ))}
    </div>
  );
}
