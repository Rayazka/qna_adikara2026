/**
 * @file    src/app/admin/login/page.tsx
 * @brief   Entry route login admin via Supabase Auth email dan password
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah tampil/sembunyi password untuk HP panitia
 *          - Tambah tautan lupa password via reset email Supabase
 */
// Sukses login → /admin (guard isAdmin di sana menolak non-admin).
// Akun dibuat di dashboard Supabase; email placeholder admin@example.com.
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";

// Tujuan: beri jalan masuk admin yang sederhana (email+password) tanpa mengganggu publik.
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Tujuan: autentikasi, pastikan user terdaftar di tabel admins, baru lempar ke dashboard.
  // Cek keanggotaan di sini agar salah user_id langsung terbaca pesannya, bukan mental diam-diam.
  async function login(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const supabase = supabaseBrowser();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError || !data.user) {
        setError("Email atau password salah");
        return;
      }
      const { data: admin } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", data.user.id)
        .single();
      if (!admin) {
        await supabase.auth.signOut();
        setError("Akun ini login OK tapi belum terdaftar sebagai admin. Cek user_id di tabel admins.");
        return;
      }
      window.location.href = "/admin";
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="h-12 w-12 rounded-full bg-white p-1 shadow-md border border-red-100 flex items-center justify-center">
            <Image
              src="/adikara-icon.svg"
              alt="Logo ADIKARA"
              width={38}
              height={38}
              className="object-contain"
            />
          </div>
        </Link>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          Login Panel Panitia
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Khusus panitia & admin cabang lomba ADIKARA 2026
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="adikara-card p-6 sm:p-8 space-y-5">
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Akun Panitia
              </label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="panitia@adikara.com"
                type="email"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                type="password"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                required
              />
            </div>

            {error !== "" && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="button w-full !py-3"
            >
              {busy ? "Memproses..." : "Masuk ke Panel Admin"}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-gray-100">
            <Link href="/" className="text-xs font-semibold text-gray-500 hover:text-red-700 transition-colors">
              ← Kembali ke Halaman Publik
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
