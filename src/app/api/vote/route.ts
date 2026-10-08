/**
 * @file    src/app/api/vote/route.ts
 * @brief   Terima vote anonim satu-kali: hash voter, delegasi ke Controller
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah endpoint cabut vote bila aturan event berubah
 *          - Normalisasi IPv6 agar hash antar format konsisten
 */
// Vote ganda dari voter sama ditolak DB (unique) dan dipetakan menjadi 409
// "Kamu sudah vote pertanyaan ini" agar client menandai tombol sebagai selesai.
import { NextResponse } from "next/server";
import { addVoteFlow } from "@/controllers/voteController";

// Tujuan: ambil IP asli sebagai separuh bahan hash identitas voter.
function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

// Tujuan: catat vote dan kembalikan counter terbaru untuk update tombol seketika.
export async function POST(request: Request) {
  let payload: { question_id?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid" }, { status: 400 });
  }
  if (typeof payload.question_id !== "string") {
    return NextResponse.json({ error: "question_id wajib diisi" }, { status: 400 });
  }
  try {
    const voteCount = await addVoteFlow({
      questionId: payload.question_id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent") ?? "",
    });
    return NextResponse.json({ vote_count: voteCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan vote";
    const status = message.includes("sudah vote") ? 409 : message.includes("menit") || message.includes("nanti") ? 429 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
