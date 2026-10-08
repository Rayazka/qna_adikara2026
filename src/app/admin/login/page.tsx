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
    <main className="mx-auto max-w-sm space-y-3 p-6">
      <h1 className="text-xl font-bold">Login Admin ADIKARA</h1>
      <form onSubmit={login} className="space-y-2">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email admin"
          type="email"
          className="w-full rounded border p-2"
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
          className="w-full rounded border p-2"
        />
        {error !== "" && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded p-2 text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--adikara-red)" }}
        >
          {busy ? "Masuk..." : "Login"}
        </button>
      </form>
    </main>
  );
}
