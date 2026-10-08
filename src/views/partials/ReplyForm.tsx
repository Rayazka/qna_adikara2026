/**
 * @file    src/views/partials/ReplyForm.tsx
 * @brief   Render form tanggapan peserta/admin di halaman detail pertanyaan
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Mengirim ke POST /api/reply; penulis login-admin otomatis berlabel ADMIN
// oleh server sehingga form tidak butuh pilihan peran. Sukses → onSent reload list.
"use client";

import { useState } from "react";

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
    <form onSubmit={submit} className="space-y-2 rounded border p-3">
      <input
        value={nama}
        onChange={(event) => setNama(event.target.value)}
        placeholder="Nama kamu"
        maxLength={50}
        className="w-full rounded border p-2"
      />
      <textarea
        value={isi}
        onChange={(event) => setIsi(event.target.value)}
        placeholder="Tulis tanggapan..."
        rows={2}
        maxLength={1000}
        className="w-full rounded border p-2"
      />
      {error !== "" && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded px-4 py-2 text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--adikara-red)" }}
      >
        {busy ? "Mengirim..." : "Kirim Tanggapan"}
      </button>
    </form>
  );
}
