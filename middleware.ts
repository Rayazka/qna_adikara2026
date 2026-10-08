/**
 * @file    middleware.ts
 * @brief   Segarkan sesi Supabase di setiap request agar server kenali admin login
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah proteksi edge penuh (tolak non-admin sebelum capai page)
 *          - Tambah log akses /admin mencurigakan dari IP asing
 */
// Pola wajib @supabase/ssr: tanpa refresh di sini, login di browser tidak
// terbaca Server Component (isAdmin selalu false → mental ke /admin/login).
// Pass-through lama adalah penyebab bug redirect tersebut.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Tujuan: sinkronkan cookies auth Supabase antara browser dan server tiap request.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  // getUser memicu refresh token kedaluwarsa sekaligus menulis ulang cookies.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
