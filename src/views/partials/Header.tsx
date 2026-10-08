/**
 * @file    src/views/partials/Header.tsx
 * @brief   Render header brand ADIKARA dengan logo dan tautan utama
 * @author  ray
 * @created 2026-10-08
 * @todo    - Ganti emoji dengan Assets/adikara-logo.webp saat final (T-19)
 */
// Header dipakai BoardView, DetailView, dan AdminView agar identitas konsisten.
// Warna selalu via CSS variable brand (lihat globals.css), tanpa hardcode hex.
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b" style={{ backgroundColor: "var(--background)" }}>
      <div className="mx-auto flex max-w-2xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold" style={{ color: "var(--adikara-red)" }}>
          ADIKARA QnA
        </Link>
        <Link href="/admin" className="text-sm underline" style={{ color: "var(--foreground)" }}>
          Admin
        </Link>
      </div>
    </header>
  );
}
