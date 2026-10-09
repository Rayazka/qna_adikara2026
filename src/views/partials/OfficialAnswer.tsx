/**
 * @file    src/views/partials/OfficialAnswer.tsx
 * @brief   Render blok jawaban resmi admin yang selalu di atas daftar reply
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tampilkan stempel waktu jawaban agar keterbaruan jelas
 *          - Tambah tombol salin jawaban untuk sebar ke grup
 */
// Hanya reply bertanda is_official yang masuk sini; reply lain dirender ReplyList.
// Warna memakai merah brand + pink pola sesuai token resmi ADIKARA.
import type { Reply } from "@/models/types";

// Tujuan: pastikan jawaban resmi selalu terlihat pertama dengan visual pembeda yang tegas.
export function OfficialAnswer({ reply }: { reply: Reply | undefined }) {
  if (!reply) return null;
  return (
    <div
      className="relative overflow-hidden rounded-2xl border-2 p-4 sm:p-5 shadow-sm"
      style={{
        borderColor: "var(--adikara-red)",
        backgroundColor: "#FFF9FA",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-black text-white shadow-xs"
          style={{ backgroundColor: "var(--adikara-red)" }}
        >
          JAWABAN RESMI PANITIA
        </span>
        <span className="text-xs font-semibold text-gray-500">• {reply.nama}</span>
      </div>
      <p className="text-sm sm:text-base font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">
        {reply.isi}
      </p>
    </div>
  );
}
