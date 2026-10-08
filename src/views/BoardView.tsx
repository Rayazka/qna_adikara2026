/**
 * @file    src/views/BoardView.tsx
 * @brief   Render papan utama: form tanya + cari + filter + sort + daftar live
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah filter Belum Terjawab untuk dorong admin bottom-up
 *          - Simpan preferensi sort di URL agar bisa dibagikan
 */
// Client component: baca publik via supabaseBrowser (diizinkan RLS SELECT),
// tulis via /api/* (Controller). Baca langsung di sini pengecualian MVC yang
// disengaja agar realtime 1 tab tanpa API list tambahan. Pinned selalu di atas.
"use client";

import { useCallback, useEffect, useState } from "react";
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

  // Tujuan: muat ulang 100 item terbaru; dipakai ulang oleh realtime dan form.
  const load = useCallback(async () => {
    const supabase = supabaseBrowser();
    const { data } = await supabase
      .from("questions")
      .select("id,nama_penanya,isi,category_id,is_pinned,is_answered,vote_count,created_at,categories(name,slug)")
      .order("is_pinned", { ascending: false })
      .limit(100)
      .returns<Question[]>();
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    // Satu channel untuk pertanyaan + vote agar count live di semua tab venue.
    const supabase = supabaseBrowser();
    const channel = supabase
      .channel("board")
      .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, () => void load())
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
    <>
      <Header />
      <main className="mx-auto max-w-2xl space-y-4 p-4">
        <h1 className="text-2xl font-bold">Tanya Jawab ADIKARA</h1>
        <AskForm onCreated={() => void load()} />
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Cari pertanyaan..."
          className="w-full rounded border p-2"
        />
        <CategoryFilter value={category} onChange={setCategory} />
        <div className="flex gap-3 text-sm">
          <button type="button" onClick={() => setSort("top")} className={sort === "top" ? "font-bold underline" : "underline"}>
            Top Vote
          </button>
          <button type="button" onClick={() => setSort("new")} className={sort === "new" ? "font-bold underline" : "underline"}>
            Terbaru
          </button>
        </div>
        {loading && <p className="text-sm text-gray-500">Memuat pertanyaan...</p>}
        {!loading && visible.length === 0 && (
          <p className="text-sm text-gray-500">Belum ada pertanyaan. Jadilah yang pertama bertanya!</p>
        )}
        {visible.map((row) => (
          <QuestionCard key={row.id} question={row} />
        ))}
      </main>
    </>
  );
}
