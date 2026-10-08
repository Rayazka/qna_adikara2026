/**
 * @file    src/app/error.tsx
 * @brief   Render batas error global dengan tombol coba lagi
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Wajib client component karena menerima retry dari Next.js.
"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-2xl space-y-2 p-4">
      <h1 className="text-xl font-bold">Terjadi kesalahan</h1>
      <p className="text-sm text-gray-600">Coba muat ulang halaman ini.</p>
      <button type="button" onClick={reset} className="rounded border px-3 py-1 text-sm">
        Coba lagi
      </button>
    </main>
  );
}
