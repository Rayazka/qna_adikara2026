/**
 * @file    src/views/partials/CategoryFilter.tsx
 * @brief   Render chips filter 6 kategori lomba + Semua untuk board
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tampilkan jumlah pertanyaan per chip dari agregat kategori
 *          - Tambah mode dropdown saat daftar kategori bertambah
 */
// Controlled component: BoardView menyimpan kategori aktif dan memfilter list.
// Kategori aktif memakai merah brand agar terlihat jelas di HP.
"use client";

export const FILTER_OPTIONS = [
  "Semua",
  "Umum",
  "Inovasi",
  "Entrepreneur",
  "Data Mining",
  "Competitive Programming",
  "Cybersecurity",
] as const;

// Tujuan: biarkan peserta menyaring board ke cabang lombanya tanpa reload halaman.
export function CategoryFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto py-2">
      {FILTER_OPTIONS.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className="shrink-0 rounded-full px-3 py-1 text-sm"
            style={
              active
                ? { backgroundColor: "var(--adikara-red)", color: "#fff" }
                : { backgroundColor: "var(--pattern-pink)", color: "var(--foreground)" }
            }
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
