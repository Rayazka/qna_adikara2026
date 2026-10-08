/**
 * @file    src/models/vote.ts
 * @brief   Query tabel votes (tambah vote unik + baca counter)
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Keunikan (question_id, voter_hash) ditegakkan DB; pelanggaran berarti voter
// sudah vote sehingga controller membalas 409. Counter naik via trigger bump_vote.
import { supabaseServer } from "@/lib/supabaseServer";

export async function addVote(questionId: string, voterHash: string): Promise<void> {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("votes")
    .insert({ question_id: questionId, voter_hash: voterHash });
  if (error) {
    if (error.code === "23505") throw new Error("DUPLICATE_VOTE");
    throw new Error(`Gagal menyimpan vote: ${error.message}`);
  }
}

export async function getVoteCount(questionId: string): Promise<number> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("questions")
    .select("vote_count")
    .eq("id", questionId)
    .single<{ vote_count: number }>();
  if (error) throw new Error(`Gagal membaca vote: ${error.message}`);
  return data.vote_count;
}
