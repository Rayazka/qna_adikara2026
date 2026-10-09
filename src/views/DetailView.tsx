/**
 * @file    src/views/DetailView.tsx
 * @brief   Render halaman detail shareable: resmi di atas + reply flat live
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah tombol bagikan native (Web Share API) untuk HP
 *          - Tambah pertanyaan terkait se-kategori di bawah diskusi
 */
// Menerima questionId dari route /q/[id]. Jawaban resmi (is_official) selalu di
// atas; sisanya kronologis. Tombol salin tautan untuk sebar via WA/MC.
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import type { Question, Reply } from "@/models/types";
import { Header } from "./partials/Header";
import { OfficialAnswer } from "./partials/OfficialAnswer";
import { ReplyForm } from "./partials/ReplyForm";
import { ReplyList } from "./partials/ReplyList";
import { VoteButton } from "./partials/VoteButton";

// Tujuan: sajikan satu pertanyaan sebagai halaman rujukan yang layak disebar.
export function DetailView({ questionId }: { questionId: string }) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [missing, setMissing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tujuan: sinkronkan pertanyaan + reply; dipanggil ulang tiap ada reply baru via realtime.
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
      <div className="min-h-screen bg-gray-50/50">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
          <span className="text-5xl block">🔍</span>
          <h1 className="text-xl font-bold text-gray-900">Pertanyaan Tidak Ditemukan</h1>
          <p className="text-sm text-gray-500">
            Pertanyaan ini mungkin telah dihapus atau tautan yang kamu buka kurang tepat.
          </p>
          <div>
            <Link href="/" className="button">
              ← Kembali ke Board QnA
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header />
        <main className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-44 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        </main>
      </div>
    );
  }

  const official = replies.find((reply) => reply.is_official);
  const rest = replies.filter((reply) => !reply.is_official);

  // Tujuan: salin URL halaman ini agar MC/peserta mudah sebar via WA.
  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-600 hover:text-red-700 transition-colors"
          >
            <span>←</span> Kembali ke Board
          </Link>

          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <span>{copied ? "✅" : "🔗"}</span>
            <span>{copied ? "Tautan Tersalin!" : "Salin Tautan"}</span>
          </button>
        </div>

        {/* Question Header Card */}
        <div className="adikara-card p-5 sm:p-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-gray-800 border border-red-100">
                {question.categories?.name ?? "Umum"}
              </span>
              {question.is_pinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">
                  <span>📌</span> Disematkan
                </span>
              )}
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                question.is_answered
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${question.is_answered ? "bg-emerald-500" : "bg-amber-500"}`} />
              {question.is_answered ? "Sudah Terjawab" : "Menunggu Jawaban Panitia"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
            {question.isi}
          </h1>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700">
                {question.nama_penanya.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-800">{question.nama_penanya}</p>
                <p className="text-[10px] text-gray-400">Penanya</p>
              </div>
            </div>

            <VoteButton questionId={question.id} initialCount={question.vote_count} />
          </div>
        </div>

        {/* Official Answer Section */}
        {official && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Jawaban Resmi</h2>
            <OfficialAnswer reply={official} />
          </div>
        )}

        {/* Discussion / Replies */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>💬</span> Tanggapan & Diskusi
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 font-bold">
                {rest.length}
              </span>
            </h2>
          </div>

          <ReplyList replies={rest} />
        </div>

        {/* Reply Form */}
        <div className="pt-2">
          <ReplyForm questionId={question.id} onSent={() => void load()} />
        </div>
      </main>
    </div>
  );
}
