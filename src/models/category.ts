/**
 * @file    src/models/category.ts
 * @brief   Query tabel categories (daftar + cari slug) untuk filter dan validasi
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Satu-satunya tempat yang boleh SELECT categories; Controller/View memanggil fungsi ini.
import { supabaseServer } from "@/lib/supabaseServer";
import type { Category } from "./types";

export async function listCategories(): Promise<Category[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug")
    .order("name")
    .returns<Category[]>();
  if (error) throw new Error(`Gagal memuat kategori: ${error.message}`);
  return data;
}

export async function findCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug")
    .eq("slug", slug)
    .single<Category>();
  // Kode PGRST116 = tidak ketemu, bukan error: kembalikan null agar controller balas 400.
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Gagal mencari kategori: ${error.message}`);
  }
  return data;
}
