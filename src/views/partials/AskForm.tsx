/**
 * @file    src/views/partials/AskForm.tsx
 * @brief   Render form tanya cepat tanpa login di atas board dengan desain modern
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
    <form onSubmit={submit} className="adikara-card p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
          <span>💬</span> Ajukan Pertanyaan
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700">
          Publik & Anonim
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Nama / Panggilan <span className="text-red-500">*</span>
          </label>
          <input
            value={nama}
            onChange={(event) => setNama(event.target.value)}
            placeholder="mis. Arya - Tim Code"
            maxLength={50}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Cabang Lomba / Kategori <span className="text-red-500">*</span>
          </label>
          <select
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
          >
            {CATEGORY_SLUGS.map((option) => (
              <option key={option} value={option}>
                {LABELS[option]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Pertanyaanmu <span className="text-red-500">*</span>
        </label>
        <textarea
          value={isi}
          onChange={(event) => setIsi(event.target.value)}
          placeholder="Tulis pertanyaanmu secara jelas dan sopan..."
          rows={3}
          maxLength={1000}
          className="w-full rounded-xl border border-gray-200 p-3.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all resize-none"
          required
        />
      </div>

      {error !== "" && (
        <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={busy}
          className="button w-full sm:w-auto"
        >
          {busy ? "Mengirim..." : "Kirim Pertanyaan 🚀"}
        </button>
      </div>
    </form>
  );
}
