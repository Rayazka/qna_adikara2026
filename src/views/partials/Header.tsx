/**
 * @file    src/views/partials/Header.tsx
 * @brief   Render header brand ADIKARA dengan logo dan navbar shadow
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah tautan kategori populer untuk navigasi cepat
 *          - Tambah indikator status koneksi realtime
 */
// Header dipakai BoardView, DetailView, dan AdminView agar identitas konsisten.
// Warna dan shadow mengikuti style guide resmi ADIKARA.
import Image from "next/image";
import Link from "next/link";

// Tujuan: tampilkan identitas visual brand ADIKARA dengan logo resmi dan navigasi admin.
export function Header() {
  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-gray-100"
      style={{ boxShadow: "var(--adikara-navbar-shadow)" }}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-red-100 bg-white p-0.5 shadow-sm">
            <Image
              src="/adikara-icon.svg"
              alt="Logo ADIKARA"
              width={36}
              height={36}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight" style={{ color: "var(--adikara-red)" }}>
              ADIKARA
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              QnA Center
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/admin"
            className="button-outline text-xs sm:text-sm !py-1.5 !px-3.5"
          >
            Panel Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
