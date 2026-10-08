/**
 * @file    src/views/DetailView.tsx
 * @brief   Render halaman detail shareable: resmi di atas + reply flat live
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Menerima questionId dari route /q/[id]. Jawaban resmi (is_official) selalu di
// atas; sisanya kronologis. Tombol salin tautan untuk sebar via WA/MC.
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import type { Question, Reply } from "@/models/types";
import { Header } from "./partials/Header";
import { OfficialAnswer } from "./partials/OfficialAnswer";
import { ReplyForm } from "./partials/ReplyForm";
import { ReplyList } from "./partials/ReplyList";
import { VoteButton } from "./partials/VoteButton";

export function DetailView({ questionId }: { questionId: string }) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [missing, setMissing] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const supabase = supabaseBrowser();
      const { data: detail } = await supabase
        .from("questions")
        .select("id,nama_penanya,isi,category_id,is_pinned,is_answered,vote_count,created_at,categories(name,slug)")
        .eq("id", questionId)
        .single<Question>();
      // ID tidak valid (bukan UUID) membuat Supabase error → tangkap di bawah.
      if (!detail) {
        setMissing(true);
        return;
      }
      setQuestion(detail);
      const { data: replyRows } = await supabase
        .from("replies")
        .select("id,question_id,nama,isi,is_admin,is_official,created_at")
        .eq("question_id", questionId)
        .order("created_at", { ascending: true })
        .returns<Reply[]>();
      setReplies(replyRows ?? []);
    } catch {
      setMissing(true);
    }
  }, [questionId]);

  useEffect(() => {
    void load();
    const supabase = supabaseBrowser();
    const channel = supabase
      .channel(`detail-${questionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "replies", filter: `question_id=eq.${questionId}` },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load, questionId]);

  if (missing) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl space-y-2 p-4">
          <p className="font-bold">Pertanyaan tidak ditemukan.</p>
          <a href="/" className="text-sm underline">
            ← Kembali ke board
          </a>
        </main>
      </>
    );
  }
  if (!question) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl p-4">
          <p className="text-sm text-gray-500">Memuat...</p>
        </main>
      </>
    );
  }

  const official = replies.find((reply) => reply.is_official);
  const rest = replies.filter((reply) => !reply.is_official);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl space-y-4 p-4">
        <a href="/" className="text-sm underline">
          ← Kembali
        </a>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold">{question.isi}</h1>
          <VoteButton questionId={question.id} initialCount={question.vote_count} />
        </div>
        <p className="text-sm text-gray-600">
          {question.nama_penanya} • {question.categories?.name ?? "Umum"} •{" "}
          {question.is_answered ? "Terjawab" : "Belum terjawab"}
        </p>
        <OfficialAnswer reply={official} />
        <ReplyList replies={rest} />
        <ReplyForm questionId={question.id} onSent={() => void load()} />
        <button type="button" onClick={() => void copyLink()} className="text-sm underline">
          {copied ? "Tautan tersalin!" : "Salin tautan pertanyaan"}
        </button>
      </main>
    </>
  );
}
