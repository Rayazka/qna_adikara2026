/**
 * @file    src/controllers/voteController.ts
 * @brief   Orkestrasi vote anonim satu-kali per pertanyaan via hash voter
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah audit lonjakan vote tak wajar per pertanyaan
 *          - Pertimbangkan allowlist IP venue untuk bobot vote berbeda
 */
// Identitas voter = hash(IP|UA) sehingga tanpa login pun double vote tertolak
// oleh unique constraint DB; controller menerjemahkannya menjadi pesan 409.
import { checkRate } from "@/lib/rateLimit";
import { hashVoter } from "@/lib/voteHash";
import { addVote, getVoteCount } from "@/models/vote";

export interface VoteInput {
  questionId: string;
  ip: string;
  userAgent: string;
}

// Tujuan: jadikan satu pintu vote yang mengembalikan counter terbaru untuk UI optimistis.
export async function addVoteFlow(input: VoteInput): Promise<number> {
  if (!input.questionId) throw new Error("question_id wajib diisi");
  if (!checkRate(`vote:${input.ip}`, 10, 60_000)) {
    throw new Error("Terlalu banyak vote, coba lagi nanti");
  }
  const voterHash = await hashVoter(input.ip, input.userAgent);
  try {
    await addVote(input.questionId, voterHash);
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_VOTE") {
      throw new Error("Kamu sudah vote pertanyaan ini");
    }
    throw error;
  }
  return getVoteCount(input.questionId);
}
