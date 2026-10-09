/**
 * @file    src/app/error.tsx
 * @brief   Render batas error global dengan tombol coba lagi
 * @author  ray
 * @created 2026-10-08
 * @todo    - Kirim laporan error ke Sentry saat monitoring dipasang
 *          - Bedakan pesan untuk gangguan jaringan vs server
 */
// Wajib client component karena menerima retry dari Next.js.
"use client";

import Link from "next/link";

// Tujuan: tangkap error render agar user dapat tombol pulih dengan visual yang ramah.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-16 text-center">
      <span className="text-5xl mb-4 block">⚠️</span>
      <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
        Terjadi Kendala Sistem
      </h1>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        Gagal memuat data saat ini. Silakan coba beberapa saat lagi atau muat ulang halaman.
      </p>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className="button !py-2.5 !px-5">
          Coba Lagi 🔄
        </button>
        <Link href="/" className="button-outline !py-2.5 !px-5">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
