/**
 * @file    src/views/partials/OfficialAnswer.tsx
 * @brief   Render blok jawaban resmi admin yang selalu di atas daftar reply
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Hanya reply bertanda is_official yang masuk sini; reply lain dirender ReplyList.
// Warna memakai merah brand + pink pola sesuai token (bukan hijau generik).
import type { Reply } from "@/models/types";

export function OfficialAnswer({ reply }: { reply: Reply | undefined }) {
  if (!reply) return null;
  return (
    <div
      className="rounded border-2 p-3"
      style={{ borderColor: "var(--adikara-red)", backgroundColor: "var(--pattern-pink)" }}
    >
      <p className="text-xs font-bold" style={{ color: "var(--adikara-dark-red)" }}>
        JAWABAN RESMI • ADMIN
      </p>
      <p className="mt-1">{reply.isi}</p>
      <p className="mt-1 text-xs text-gray-600">{reply.nama}</p>
    </div>
  );
}
