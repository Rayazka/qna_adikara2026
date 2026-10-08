/**
 * @file    src/lib/supabaseClient.ts
 * @brief   Buat Supabase browser client untuk komponen client (realtime + baca publik)
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Browser client dipakai View client (board/detail) untuk SELECT yang diizinkan
// RLS + subscribe Realtime. Memakai anon key publik yang aman karena RLS aktif.
import { createBrowserClient } from "@supabase/ssr";

export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
