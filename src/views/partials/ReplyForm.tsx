/**
 * @file    src/views/partials/ReplyForm.tsx
 * @brief   Render form tanggapan tanpa login (langsung isi tanggapan)
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah pratinjau sebelum kirim untuk cegah salah ketik
 *          - Simpan draf ke localStorage agar tidak hilang saat reload
 */
// Mengirim ke POST /api/reply; penulis login-admin otomatis berlabel ADMIN
// oleh server. Sukses → onSent reload list.
"use client";

import { useState } from "react";

// Tujuan: tampung tanggapan lanjutan secara instan tanpa mewajibkan isi nama.
export function ReplyForm({
  questionId,
  onSent,
}: {
  questionId: string;
  onSent: () => void;
}) {
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
        body: JSON.stringify({ question_id: questionId, isi }),
      });
      const body = (await response.json()) as { id?: string; error?: string };
      if (!response.ok) {
        setError(body.error ?? "Gagal mengirim tanggapan, silakan coba lagi.");
        return;
      }
      setIsi("");
      onSent();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="adikara-card p-4 sm:p-5 space-y-3">
      <h4 className="text-sm font-bold text-gray-900">
        Tulis Tanggapan
      </h4>

      <textarea
        value={isi}
        onChange={(event) => setIsi(event.target.value)}
        placeholder="Berikan tanggapan atau informasi tambahan..."
        rows={2}
        maxLength={1000}
        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all resize-none bg-gray-50/50 focus:bg-white placeholder:text-gray-400"
        required
      />

      {error !== "" && (
        <div className="rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={busy || isi.trim().length === 0}
          className="button text-xs sm:text-sm !py-2 !px-5"
        >
          {busy ? "Mengirim..." : "Kirim Tanggapan"}
        </button>
      </div>
    </form>
  );
}
