/**
 * @file    src/app/admin/page.tsx
 * @brief   Entry route dashboard admin dengan guard login via redirect
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Server Component: cek isAdmin() sebelum merender AdminView yang memuat data.
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/supabaseServer";
import { AdminView } from "@/views/AdminView";

// Guard auth membaca cookies sehingga dibungkus Suspense: halaman tetap bisa
// di-prerender sebagai shell, isi dashboard streaming setelah cookies terbaca.
export default function Admin() {
  return (
    <Suspense fallback={<p className="p-4 text-sm text-gray-500">Memuat dashboard...</p>}>
      <AdminGate />
    </Suspense>
  );
}

async function AdminGate() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminView />;
}
