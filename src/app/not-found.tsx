/**
 * @file    src/app/not-found.tsx
 * @brief   Render halaman 404 global saat route tidak dikenal
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah pencarian dari halaman 404 agar user tidak buntu
 *          - Catat URL 404 populer untuk perbaiki tautan sebaran
 */
import Link from "next/link";

// Tujuan: arahkan user nyasar kembali ke board alih-alih jalan buntu.
export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl space-y-2 p-4">
      <h1 className="text-xl font-bold">Halaman tidak ditemukan</h1>
      <Link href="/" className="text-sm underline">
        ← Kembali ke board QnA
      </Link>
    </main>
  );
}
