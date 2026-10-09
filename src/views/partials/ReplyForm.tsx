/**
 * @file    src/views/partials/ReplyForm.tsx
 * @brief   Render form tanggapan peserta/admin di halaman detail pertanyaan
 * @author  ray
 * @created 2026-10-08
 * @todo    - Isi otomatis nama dari pertanyaan terakhir user
 *          - Tambah pratinjau sebelum kirim untuk cegah salah ketik
 */
// Mengirim ke POST /api/reply; penulis login-admin otomatis berlabel ADMIN
// oleh server sehingga form tidak butuh pilihan peran. Sukses → onSent reload list.
"use client";

import { useState } from "react";

// Tujuan: tampung tanggapan lanjutan tanpa memecah alur baca diskusi.
export function ReplyForm({
  questionId,
  onSent,
}: {
  questionId: string;
  onSent: () => void;
}) {
  const [nama, setNama] = useState("");
  const [isi, setIsi] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Tujuan: kirim tanggapan lalu kosongkan form agar user bisa langsung menulis lagi.
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId, nama, isi }),
      });
      const body = (await response.json()) as { id?: string; error?: string };
      if (!response.ok) {
        setError(body.error ?? "Gagal mengirim, coba lagi");
        return;
      }
      setNama("");
      setIsi("");
      onSent();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="adikara-card p-4 sm:p-5 space-y-3">
      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
        <span>✍️</span> Tulis Tanggapan
      </h4>

      <input
        value={nama}
        onChange={(event) => setNama(event.target.value)}
        placeholder="Nama / Panggilan kamu"
        maxLength={50}
        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
        required
      />

      <textarea
        value={isi}
        onChange={(event) => setIsi(event.target.value)}
        placeholder="Berikan tanggapan atau informasi tambahan..."
        rows={2}
        maxLength={1000}
        className="w-full rounded-xl border border-gray-200 p-3.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all resize-none"
        required
      />

      {error !== "" && (
        <div className="rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-600 border border-red-100">
          ⚠️ {error}
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={busy}
          className="button text-xs sm:text-sm !py-2.5 !px-5"
        >
          {busy ? "Mengirim..." : "Kirim Tanggapan"}
        </button>
      </div>
    </form>
  );
}
