/**
 * @file    src/app/not-found.tsx
 * @brief   Render halaman 404 global saat route tidak dikenal
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah pencarian dari halaman 404 agar user tidak buntu
 *          - Catat URL 404 populer untuk perbaiki tautan sebaran
 */
import Link from "next/link";
import Image from "next/image";

// Tujuan: arahkan user nyasar kembali ke board dengan tampilan ramah.
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-white p-2 shadow-md border border-red-100 flex items-center justify-center mb-4">
        <Image
          src="/adikara-icon.svg"
          alt="Logo ADIKARA"
          width={48}
          height={48}
          className="object-contain"
        />
      </div>
      <span className="text-4xl font-black text-red-600 mb-1">404</span>
      <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        Halaman yang kamu tuju tidak tersedia atau tautan telah kedaluwarsa.
      </p>
      <Link href="/" className="button">
        ← Kembali ke Board QnA ADIKARA
      </Link>
    </div>
  );
}
