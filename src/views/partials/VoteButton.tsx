/**
 * @file    src/views/partials/VoteButton.tsx
 * @brief   Render tombol vote satu-kali per pertanyaan dengan guard browser lokal
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Guard ganda: localStorage mencegah klik ulang di browser ini, server menolak
// double vote via unique voter_hash (409). Count optimistis langsung naik.
"use client";

import { useState } from "react";

function votedKey(questionId: string): string {
  return `voted:${questionId}`;
}

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
      className="rounded border px-2 py-1 text-sm disabled:opacity-60"
      style={done ? undefined : { borderColor: "var(--adikara-red)", color: "var(--adikara-red)" }}
    >
      {done ? `✓ ${count}` : `▲ ${count}`}
    </button>
  );
}
