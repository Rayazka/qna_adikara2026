/**
 * @file    src/views/partials/CategoryFilter.tsx
 * @brief   Render chips filter 6 kategori lomba + Semua untuk board
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tampilkan jumlah pertanyaan per chip dari agregat kategori
 *          - Tambah mode dropdown saat daftar kategori bertambah
 */
// Controlled component: BoardView menyimpan kategori aktif dan memfilter list.
// Desain pill modern dengan transisi halus sesuai style guide ADIKARA.
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
    <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
      {FILTER_OPTIONS.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className="shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200"
            style={
              active
                ? {
                    backgroundColor: "var(--adikara-red)",
                    color: "#FFFFFF",
                    boxShadow: "var(--adikara-button-shadow)",
                  }
                : {
                    backgroundColor: "var(--adikara-pattern-pink)",
                    color: "var(--adikara-foreground)",
                  }
            }
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
