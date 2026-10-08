/**
 * @file    src/views/partials/ReplyList.tsx
 * @brief   Render daftar reply flat kronologis dengan badge peran penulis
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Flat 1 level tanpa vote dan tanpa balasan-ke-balasan (keputusan MVP).
// Badge ADMIN merah, Peserta abu-abu agar jawaban panitia mudah dikenali.
import type { Reply } from "@/models/types";

export function ReplyList({ replies }: { replies: Reply[] }) {
  if (replies.length === 0) {
    return <p className="text-sm text-gray-500">Belum ada tanggapan. Jadilah yang pertama!</p>;
  }
  return (
    <div className="space-y-2">
      {replies.map((reply) => (
        <div key={reply.id} className="rounded border p-2">
          <p className="text-xs text-gray-600">
            {reply.is_admin ? (
              <span
                className="rounded px-1 font-bold text-white"
                style={{ backgroundColor: "var(--adikara-red)" }}
              >
                ADMIN
              </span>
            ) : (
              <span className="rounded bg-gray-200 px-1">Peserta</span>
            )}{" "}
            {reply.nama}
          </p>
          <p className="mt-1 text-sm">{reply.isi}</p>
        </div>
      ))}
    </div>
  );
}
