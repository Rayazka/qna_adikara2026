/**
 * @file    middleware.ts
 * @brief   Daftarkan matcher /admin agar guard login konsisten di edge
 * @author  ray
 * @created 2026-10-08
 * @todo    - Pindahkan cek isAdmin ke sini saat butuh proteksi edge penuh (T-20 susulan)
 *          - Tambah log akses /admin mencurigakan dari IP asing
 */
// Pass-through sengaja: proteksi nyata ada di src/app/admin/page.tsx (isAdmin +
// redirect) agar ultra-MVP 1-3 hari tidak tersendat kompleksitas edge + Supabase.
import { NextResponse } from "next/server";

// Tujuan: tandai /admin agar kelak guard edge konsisten tanpa ubah matcher.
export function middleware() {
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
