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
      <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-200">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
        Terjadi Kendala Sistem
      </h1>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        Gagal memuat data saat ini. Silakan coba beberapa saat lagi atau muat ulang halaman.
      </p>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className="button !py-2.5 !px-5 cursor-pointer">
          Coba Lagi
        </button>
        <Link href="/" className="button-outline !py-2.5 !px-5">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
