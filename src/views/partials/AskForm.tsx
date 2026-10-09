/**
 * @file    src/views/partials/AskForm.tsx
 * @brief   Render form tanya cepat tanpa login ala Slido (langsung input pertanyaan)
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

// Tujuan: beri pengalaman bertanya instan ala Slido tanpa meminta nama peserta.
export function AskForm({ onCreated }: { onCreated: () => void }) {
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
        body: JSON.stringify({ isi, category_slug: slug }),
      });
      const body = (await response.json()) as { id?: string; error?: string };
      if (!response.ok) {
        setError(body.error ?? "Gagal mengirim pertanyaan, silakan coba lagi.");
        return;
      }
      setIsi("");
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="adikara-card p-4 sm:p-5 space-y-3">
      <div>
        <textarea
          value={isi}
          onChange={(event) => setIsi(event.target.value)}
          placeholder="Tulis pertanyaanmu seputar lomba ADIKARA di sini..."
          rows={3}
          maxLength={1000}
          className="w-full rounded-2xl border border-gray-200 p-3.5 sm:p-4 text-sm sm:text-base focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all resize-none bg-gray-50/50 focus:bg-white placeholder:text-gray-400"
          required
        />
      </div>

      {error !== "" && (
        <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <label htmlFor="category-select" className="text-xs font-bold text-gray-600 shrink-0">
            Kategori Cabang:
          </label>
          <select
            id="category-select"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all shadow-xs"
          >
            {CATEGORY_SLUGS.map((option) => (
              <option key={option} value={option}>
                {LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={busy || isi.trim().length === 0}
          className="button !py-2.5 !px-6 text-sm w-full sm:w-auto"
        >
          {busy ? "Mengirim..." : "Kirim Pertanyaan"}
        </button>
      </div>
    </form>
  );
}
