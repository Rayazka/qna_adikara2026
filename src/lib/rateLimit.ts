/**
 * @file    src/lib/rateLimit.ts
 * @brief   Batasi request anonim per IP untuk redam spam tanpa login
 * @author  ray
 * @created 2026-10-08
 * @todo    - Ganti ke Redis/Upstash saat traffic event melebihi 1 instance
 */
// MVP memakai Map in-memory (cukup untuk 1 instance Vercel saat event).
// Aturan: tanya 1/menit, reply 3/menit, vote 10/menit per IP (diterapkan di controller).
const hits = new Map<string, number[]>();

// Mengembalikan true jika request masih dalam limit (dan mencatat hit ini).
export function checkRate(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
