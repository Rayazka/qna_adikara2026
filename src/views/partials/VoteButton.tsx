/**
 * @file    src/views/partials/VoteButton.tsx
 * @brief   Render tombol vote satu-kali per pertanyaan dengan guard browser lokal
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah animasi getar halus saat vote berhasil
 *          - Sinkronkan status voted antar tab via event storage
 */
// Guard ganda: localStorage mencegah klik ulang di browser ini, server menolak
// double vote via unique voter_hash (409). Count optimistis langsung naik.
"use client";

import { useState } from "react";

// Tujuan: buat kunci penyimpanan lokal unik per pertanyaan agar status vote awet saat reload.
function votedKey(questionId: string): string {
  return `voted:${questionId}`;
}

// Tujuan: naikkan pointing pertanyaan populer dengan sekali klik yang tidak bisa diulang.
export function VoteButton({
  questionId,
  initialCount,
}: {
  questionId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [done, setDone] = useState<boolean>(
    () => typeof window !== "undefined" && localStorage.getItem(votedKey(questionId)) === "1",
  );
  const [busy, setBusy] = useState(false);

  // Tujuan: kirim vote lalu kunci tombol; 409 dari server berarti voter ini memang sudah vote.
  async function vote() {
    if (done || busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId }),
      });
      if (response.ok) {
        const body = (await response.json()) as { vote_count: number };
        setCount(body.vote_count);
        localStorage.setItem(votedKey(questionId), "1");
        setDone(true);
      } else if (response.status === 409) {
        // Server tahu voter ini sudah vote (misal ganti browser lalu kembali).
        localStorage.setItem(votedKey(questionId), "1");
        setDone(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={vote}
      disabled={done || busy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
        done
          ? "bg-gray-100 text-gray-500 border border-gray-200 cursor-default"
          : "border border-red-200 text-red-700 bg-red-50/70 hover:bg-red-100 hover:scale-105 active:scale-95 shadow-sm"
      }`}
      aria-label={`Dukung pertanyaan (${count} vote)`}
    >
      <span className={done ? "text-green-600 font-black" : "text-red-600 font-black text-sm leading-none"}>
        {done ? "✓" : "▲"}
      </span>
      <span>{count}</span>
    </button>
  );
}
