/**
 * @file    src/views/BoardView.tsx
 * @brief   Render papan utama: hero banner + form tanya + cari + filter + sort + daftar live
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah filter Belum Terjawab untuk dorong admin bottom-up
 *          - Simpan preferensi sort di URL agar bisa dibagikan
 */
// Client component: baca publik via supabaseBrowser (diizinkan RLS SELECT),
// tulis via /api/* (Controller). Pinned selalu di atas.
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabaseClient";
import type { Question } from "@/models/types";
import { AskForm } from "./partials/AskForm";
import { CategoryFilter } from "./partials/CategoryFilter";
import { Header } from "./partials/Header";
import { QuestionCard } from "./partials/QuestionCard";

type SortMode = "top" | "new";

// Tujuan: jadikan satu layar pusat event: bertanya, mencari, menyaring, dan mem-vote.
export function BoardView() {
  const [rows, setRows] = useState<Question[]>([]);
  const [category, setCategory] = useState<string>("Semua");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<SortMode>("top");
  const [loading, setLoading] = useState(true);

  // Tujuan: muat ulang 100 item terbaru beserta balasan; dipakai ulang oleh realtime dan form.
  const load = useCallback(async () => {
    const supabase = supabaseBrowser();
    const { data } = await supabase
      .from("questions")
      .select("id,nama_penanya,isi,category_id,is_pinned,is_answered,vote_count,created_at,categories(name,slug),replies(id,question_id,nama,isi,is_admin,is_official,created_at)")
      .order("is_pinned", { ascending: false })
      .limit(100)
      .returns<Question[]>();
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    // Satu channel untuk pertanyaan + vote + replies agar board live di semua tab venue.
    const supabase = supabaseBrowser();
    const channel = supabase
      .channel("board")
      .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "replies" }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const visible = rows
    .filter(
      (row) =>
        (category === "Semua" || row.categories?.name === category) &&
        (keyword === "" || row.isi.toLowerCase().includes(keyword.toLowerCase())),
    )
    .sort((a, b) =>
      // Pin didahulukan apa pun modenya; lalu vote atau waktu.
      Number(b.is_pinned) - Number(a.is_pinned) ||
      (sort === "top" ? b.vote_count - a.vote_count : +new Date(b.created_at) - +new Date(a.created_at)),
    );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100 py-8 sm:py-12">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-red-50 blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left space-y-2 max-w-xl">
              <div className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-100">
                Portal Tanya Jawab Resmi ADIKARA 2026
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                Pertanyaan Seputar Lomba
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Ajukan pertanyaan seputar cabang lomba tanpa login. Berikan dukungan vote agar pertanyaan penting dijawab panitia.
              </p>
            </div>

            <div className="hidden sm:flex shrink-0 items-center justify-center">
              <div className="h-24 w-24 relative rounded-3xl bg-gradient-to-tr from-red-600 to-amber-400 p-1 shadow-lg shadow-red-500/20">
                <div className="h-full w-full bg-white rounded-[22px] flex items-center justify-center p-3">
                  <Image
                    src="/adikara-icon.svg"
                    alt="Logo ADIKARA"
                    width={72}
                    height={72}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
        {/* Form Tanya Slido */}
        <AskForm onCreated={() => void load()} />

        {/* Toolbar Pencarian, Filter Kategori & Sort */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Cari pertanyaan lomba..."
                className="w-full rounded-full border border-gray-200 pl-10 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 shadow-xs transition-all"
              />
              {keyword !== "" && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center self-center sm:self-auto bg-gray-100 p-1 rounded-full text-xs font-bold border border-gray-200">
              <button
                type="button"
                onClick={() => setSort("top")}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  sort === "top"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Terpopuler
              </button>
              <button
                type="button"
                onClick={() => setSort("new")}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  sort === "new"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Terbaru
              </button>
            </div>
          </div>

          {/* Kategori Filter */}
          <CategoryFilter value={category} onChange={setCategory} />
        </div>

        {/* Question List */}
        <div className="space-y-3 pt-1">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-28 rounded-2xl bg-white animate-pulse border border-gray-100 p-4" />
              ))}
            </div>
          )}

          {!loading && visible.length === 0 && (
            <div className="adikara-card p-10 text-center space-y-2">
              <h3 className="font-bold text-gray-800 text-base">Belum ada pertanyaan</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {keyword !== "" || category !== "Semua"
                  ? "Tidak ada pertanyaan yang sesuai dengan filter atau kata kunci pencarian."
                  : "Jadilah peserta pertama yang mengajukan pertanyaan seputar lomba."}
              </p>
            </div>
          )}

          {visible.map((row) => (
            <QuestionCard key={row.id} question={row} />
          ))}
        </div>
      </main>
    </div>
  );
}
