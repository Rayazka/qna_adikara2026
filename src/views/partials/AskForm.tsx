/**
 * @file    src/views/partials/AskForm.tsx
 * @brief   Render form tanya cepat tanpa login di atas board
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah penghitung sisa karakter agar user tahu batas
 *          - Simpan draf ke localStorage agar tidak hilang saat reload
 */
// Mengirim ke POST /api/ask; error server (validasi/rate-limit) ditampilkan
// berbahasa Indonesia di bawah form. Sukses → reset + panggil onCreated agar board reload.
"use client";

import { useState } from "react";
import { CATEGORY_SLUGS } from "@/models/validation";

const LABELS: Record<string, string> = {
  umum: "Umum",
  inovasi: "Inovasi",
  entrepreneur: "Entrepreneur",
  "data-mining": "Data Mining",
  "competitive-programming": "Competitive Programming",
  cybersecurity: "Cybersecurity",
};

// Tujuan: turunkan friksi bertanya hingga 30 detik: nama + kategori + isi lalu terkirim.
export function AskForm({ onCreated }: { onCreated: () => void }) {
  const [nama, setNama] = useState("");
  const [isi, setIsi] = useState("");
  const [slug, setSlug] = useState<string>("umum");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Tujuan: validasi ringan di client dulu agar error server yang mahal jarang terjadi.
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, isi, category_slug: slug }),
      });
      const body = (await response.json()) as { id?: string; error?: string };
      if (!response.ok) {
        setError(body.error ?? "Gagal mengirim, coba lagi");
        return;
      }
      setNama("");
      setIsi("");
      onCreated();
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
      <select
        value={slug}
        onChange={(event) => setSlug(event.target.value)}
        className="w-full rounded border p-2"
      >
        {CATEGORY_SLUGS.map((option) => (
          <option key={option} value={option}>
            {LABELS[option]}
          </option>
        ))}
      </select>
      <textarea
        value={isi}
        onChange={(event) => setIsi(event.target.value)}
        placeholder="Tulis pertanyaanmu..."
        rows={3}
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
        {busy ? "Mengirim..." : "Kirim Pertanyaan"}
      </button>
    </form>
  );
}
