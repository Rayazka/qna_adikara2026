/**
 * @file    src/lib/supabaseServer.ts
 * @brief   Buat Supabase server client + cek status admin untuk Route Handler
 * @author  ray
 * @created 2026-10-08
 * @todo    - Cache hasil isAdmin per request untuk hemat query
 *          - Catat audit login admin ke tabel log bila dibutuhkan
 */
// Server client meneruskan cookies auth sehingga RLS mengenali admin.
// WAJIB dipanggil dari konteks request (Route Handler / Server Component),
// karena cookies() hanya tersedia di server. isAdmin() memeriksa tabel admins.
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Tujuan: teruskan cookies auth ke Supabase agar RLS mengenali admin di sisi server.
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set() {
          // Route Handler tidak menulis cookie auth di sini; login ditangani client.
        },
        remove() {
          // Lihat komentar set() di atas.
        },
      },
    },
  );
}

// Tujuan: jadikan satu-satunya penentu hak admin agar guard tidak tersebar di tiap halaman.
// Mengembalikan true hanya jika user login dan user_id terdaftar di tabel admins.
export async function isAdmin(): Promise<boolean> {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .single();
  return data !== null;
}
