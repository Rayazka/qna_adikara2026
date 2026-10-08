/**
 * @file    src/app/api/reply/route.ts
 * @brief   Terima reply anonim/peserta/admin: validasi, rate-limit, delegasi
 * @author  ray
 * @created 2026-10-08
 * @todo    - Batasi panjang reply admin berbeda dari peserta bila perlu
 *          - Tambah idempotency key agar retry tidak ganda
 */
// Adapter tipis di atas replyController; penulis admin otomatis berlabel ADMIN
// oleh server (lihat controller), jadi client tidak mengirim peran apa pun.
import { NextResponse } from "next/server";
import { createReplyFlow } from "@/controllers/replyController";

// Tujuan: ambil IP asli untuk rate-limit reply yang adil per pengirim.
function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

// Tujuan: terima tanggapan dan kembalikan id agar detail langsung memuat reply baru.
export async function POST(request: Request) {
  let payload: { question_id?: unknown; nama?: unknown; isi?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid" }, { status: 400 });
  }
  if (typeof payload.question_id !== "string" || typeof payload.nama !== "string" || typeof payload.isi !== "string") {
    return NextResponse.json({ error: "question_id, nama, dan isi wajib diisi" }, { status: 400 });
  }
  try {
    const id = await createReplyFlow({
      questionId: payload.question_id,
      nama: payload.nama,
      isi: payload.isi,
      ip: clientIp(request),
    });
    return NextResponse.json({ id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan balasan";
    const status = message.includes("menit") || message.includes("sebentar") ? 429 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
