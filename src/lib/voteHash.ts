/**
 * @file    src/lib/voteHash.ts
 * @brief   Hitung identitas anonim voter dari IP + user-agent untuk cegah double vote
 * @author  ray
 * @created 2026-10-08
 * @todo    - Rotasi salt hash berkala agar fingerprint lama kedaluwarsa
 *          - Evaluasi sinyal tambahan (ASN) bila abuse vote meningkat
 */
// Publik tanpa login, jadi server menandai voter lewat hash SHA-256(IP|UA).
// Tujuan: ubah IP+UA menjadi sidik 64-hex yang stabil agar voter sama selalu dikenali.
// Kolom votes.voter_hash unik per question sehingga vote ganda ditolak DB (409).
export async function hashVoter(ip: string, userAgent: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${ip}|${userAgent}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
