/**
 * @file    src/app/api/ask/route.ts
 * @brief   Terima pertanyaan anonim: validasi, rate-limit, delegasi ke Controller
 * @author  ray
 * @created 2026-10-08
 * @todo    - Teruskan kode Turnstile dari client saat site key tersedia
 *          - Tambah logging server untuk pola spam berulang
 */
// Adapter tipis: parsing body + IP client → askController. Pesan error controller
// (bahasa Indonesia) diteruskan apa adanya; error tak dikenal menjadi 500 generik.
import { NextResponse } from "next/server";
import { createQuestionFlow } from "@/controllers/askController";

// Tujuan: ambil IP asli di balik proxy Vercel untuk rate-limit yang adil per pengirim.
function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

// Tujuan: terima form tanya dan kembalikan id agar board langsung memuat item baru.
export async function POST(request: Request) {
  let payload: { nama?: unknown; isi?: unknown; category_slug?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid" }, { status: 400 });
  }
  if (typeof payload.isi !== "string" || typeof payload.category_slug !== "string") {
    return NextResponse.json({ error: "isi dan category_slug wajib diisi" }, { status: 400 });
  }
  const nama = typeof payload.nama === "string" ? payload.nama : "Peserta";
  try {
    const id = await createQuestionFlow({
      nama,
      isi: payload.isi,
      categorySlug: payload.category_slug,
      ip: clientIp(request),
    });
    return NextResponse.json({ id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan pertanyaan";
    const status = message.includes("menit") ? 429 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
