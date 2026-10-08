# TECH SPEC — QnA ADIKARA (Vibe Coding Ready v1.0)

> Acuan wajib: `.agents/1-PRD.md` (Bab 1 Why) + `docs/superpowers/plans/2026-10-07-qna-adikara.md`
> Stack locked: Next.js 14+ App Router + Supabase Postgres + Vercel. Timeline ultra-MVP 1-3 hari.

---

## BAGIAN 1: Tech Stack & Arsitektur

### Tech Stack
| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js App Router | 14+ |
| Language | TypeScript | 5.x strict |
| Styling | Tailwind CSS | 3.x |
| State | React Server Components + client `useState` + Supabase Realtime channel (tanpa Redux/Zustand) | - |
| Backend | Next.js Route Handlers (`app/api/*/route.ts`) | 14+ |
| Database | Supabase Postgres (Postgres 15 managed) + Realtime | - |
| ORM/Driver | `supabase-js` + `@supabase/ssr` (tanpa Prisma/Drizzle — direct client + RLS) | latest |
| Auth | Supabase Auth email+password, admin-only via tabel `admins(user_id)` | - |
| Hosting | Vercel (Hobby) | - |
| Caching | None (MVP; ISR/Realtime cukup, Redis ditunda) | - |
| Anti-bot | Cloudflare Turnstile (server verify di Route Handler) | - |

### Arsitektur Sistem
```
Browser (mobile-first, ID)
  → Vercel Next.js: Pages (/, /q/[id], /admin) + Route Handlers (/api/ask, /api/reply, /api/vote)
  → Supabase: Postgres (RLS) + Auth (admin) + Realtime (questions, votes, replies)
  → Cloudflare Turnstile verify (server-side, untuk form anon)
Tanpa file storage. Tanpa cache layer di MVP.
```

- Publik: anon → Route Handler (validasi + rate-limit + voter_hash + Turnstile) → insert via `supabaseServer()` (anon key, RLS INSERT) → Realtime broadcast → board/detail update <3s.
- Admin: login Supabase Auth → `isAdmin()` cek tabel `admins` → UPDATE/DELETE via server client (RLS admin policy `auth.uid()`).
- Vote: `hashVoter(IP + UA)` SHA-256 server-side + `localStorage voted:<id>` client → `votes(question_id, voter_hash)` unique → trigger `bump_vote()` increment `questions.vote_count`.

### Struktur Folder (MVC di atas Next.js 14 App Router)

> Next.js wajib pakai `app/` sebagai entry route, jadi MVC dipetakan: **Model** = `models/` + `supabase/`, **View** = `app/` + `views/`, **Controller** = `controllers/` yang dipanggil tipis oleh `app/api/*/route.ts`.

```
supabase/schema.sql              # DDL + RLS + trigger + seed (Model: definisi data)
models/
  types.ts                       # Model: tipe Question, Reply, Category, Vote
  category.ts                    # Model: query categories (list, findBySlug)
  question.ts                    # Model: query questions (list, detail, create, setPin, setAnswered, setCategory, remove)
  reply.ts                       # Model: query replies (listByQuestion, create, setOfficial, remove)
  vote.ts                        # Model: query votes (addVote unique, countByQuestion)
  validation.ts                  # Model: validateNama/validateIsi + CATEGORIES (aturan domain)
controllers/
  askController.ts               # Controller: createQuestion(nama, isi, slug) → validasi + rate-limit + insert
  replyController.ts             # Controller: createReply(questionId, nama, isi, isAdmin)
  voteController.ts              # Controller: addVote(questionId, ip, ua) → hashVoter + unique guard
  adminController.ts             # Controller: setOfficial, setPin, setCategory, removeQuestion/Reply (guard isAdmin)
views/
  BoardView.tsx                  # View: board (filter + search + sort + list) — dipakai app/page.tsx
  DetailView.tsx                 # View: detail /q/[id] + official + replies — dipakai app/q/[id]/page.tsx
  AdminView.tsx                  # View: tabel dashboard — dipakai app/admin/page.tsx
  partials/
    AskForm.tsx                  # View partial: form tanya
    QuestionCard.tsx             # View partial: card
    VoteButton.tsx               # View partial: tombol vote
    CategoryFilter.tsx           # View partial: chips kategori
    ReplyList.tsx / ReplyForm.tsx / OfficialAnswer.tsx
app/                             # View entry (wajib Next.js, tipis, delegasi ke views/ + controllers/)
  layout.tsx
  page.tsx                       # → <BoardView />
  q/[id]/page.tsx                # → <DetailView />
  admin/login/page.tsx
  admin/page.tsx                 # guard isAdmin() → <AdminView />
  api/ask/route.ts               # → askController.createQuestion()
  api/reply/route.ts             # → replyController.createReply()
  api/vote/route.ts              # → voteController.addVote()
lib/                             # Core infra (dipakai Model + Controller)
  supabaseClient.ts              # createBrowserClient
  supabaseServer.ts              # createServerClient + isAdmin()
  voteHash.ts                    # hashVoter()
  rateLimit.ts                   # checkRate()
  __tests__/                     # vitest untuk models/validation + controllers (pure logic)
middleware.ts
vitest.config.ts
.env.local
```

**Aturan MVC (wajib):**
- View tidak boleh query Supabase langsung — panggil Controller atau Model function.
- Controller tidak boleh render JSX — hanya orkestrasi: validasi → rate-limit → panggil Model → return DTO.
- Model satu-satunya yang import `supabaseServer/supabaseClient` untuk query tabelnya sendiri.

### Justifikasi
- **Next.js App Router:** 1 codebase board+detail+admin, SSR untuk SEO arsip FAQ + client Realtime untuk live event; deploy Vercel 1 klik, kejar 1-3 hari.
- **Supabase Postgres + RLS:** relasional question→reply→vote pas; RLS memisahkan publik (SELECT+INSERT) vs admin (UPDATE/DELETE) tanpa backend terpisah; Realtime gratis menggantikan polling/WebSocket custom.
- **Tanpa ORM:** skema kecil (5 tabel), `supabase-js` cukup; Prisma menambah waktu setup/migrasi yang tidak ada di timeline.
- **Vercel:** native Next.js, env simpel, Hobby tier cukup untuk event <10k question.
- **Turnstile:** wajib karena form anon ganda (tanya + reply); lebih ringan dari captcha gambar.

---

## BAGIAN 2: Database Design

### Ringkasan Database
| Item | Detail |
|------|--------|
| Database | Supabase Postgres (managed PG 15) |
| ORM/Driver | `supabase-js` + `@supabase/ssr`, tanpa ORM |
| Pendekatan | Relational (FK + cascade + unique constraint) |
| Tools Migrasi | Manual via Supabase SQL editor (`supabase/schema.sql` dic commit sebagai source of truth) |

### Entity Overview
| Entity | Key Fields | Relasi |
|--------|-----------|--------|
| categories | id (uuid pk), name unique, slug unique | → questions (1:N) |
| questions | id, nama_penanya (2-50), isi (10-1000), category_id FK, is_pinned, is_answered, vote_count, created_at | ← categories; → replies (1:N cascade); → votes (1:N cascade) |
| replies | id, question_id FK cascade, nama (2-50), isi (2-1000), is_admin, is_official, created_at | ← questions |
| votes | id, question_id FK cascade, voter_hash, created_at, unique(question_id, voter_hash) | ← questions |
| admins | user_id (uuid pk, = auth.users.id) | standalone flag |

Seed: 6 rows categories — Umum/umum, Inovasi/inovasi, Entrepreneur/entrepreneur, Data Mining/data-mining, Competitive Programming/competitive-programming, Cybersecurity/cybersecurity.

### DDL Acuan (ringkas, full di `supabase/schema.sql`)
- `questions.category_id → categories.id` (restrict, admin pindah via UPDATE).
- `replies.question_id → questions.id ON DELETE CASCADE`; `votes.question_id → questions.id ON DELETE CASCADE`.
- Trigger `trg_bump_vote AFTER INSERT ON votes → bump_vote()` increment `questions.vote_count`.
- RLS ON untuk categories/questions/replies/votes. Publik: SELECT semua + INSERT questions/replies/votes. UPDATE/DELETE questions + ALL replies hanya jika `exists (select 1 from admins where user_id = auth.uid())`.
- Aturan 1 jawaban resmi per question ditegakkan di aplikasi (saat set `is_official=true`, unset yang lama dalam 1 transaksi) — bukan DB constraint agar 1-3 hari tercapai.

### Index Strategy
- `questions(category_id)` — filter chips 6 kategori di board.
- `questions(is_pinned)` — pinned selalu di atas (order pinned desc).
- `questions(created_at)` — sort Terbaru.
- `replies(question_id, created_at)` — load flat kronologis di `/q/[id]`.
- `votes(question_id, voter_hash)` unique — cegah double vote + lookup cepat.

### Data Flow
Peserta isi AskForm → `POST /api/ask` → insert `questions` (category dari slug) → Realtime `questions` → board reload. Vote → `POST /api/vote` → insert `votes` → trigger `bump_vote` → Realtime → count naik. Reply → `POST /api/reply` → insert `replies` (`is_admin=true` jika `isAdmin()`) → Realtime channel `detail-<id>` → list flat update. Admin set resmi → UPDATE `replies.is_official` + `questions.is_answered=true` → `/q/[id]` highlight hijau + board badge Terjawab. Hapus spam → DELETE `questions` (replies+votes ikut cascade).

---

## BAGIAN 3: Interface Design (Next.js: Routes + API + Controllers)

> Keputusan user: keys Supabase/Vercel dikirim nanti (pakai `.env` placeholder); Turnstile dilewati dulu (rate-limit saja, verify opsional jika key ada); admin placeholder `admin@example.com`; brand/logo menyusul (View pakai CSS variable agar gampang swap).

### 3.1 Pages / Routes (View entry — tipis, delegasi ke `views/`)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/` | Board: list + search + filter 6 kategori + sort + AskForm | No |
| GET | `/q/[id]` | Detail shareable: question + OfficialAnswer + ReplyList flat + ReplyForm + copy-link | No |
| GET | `/admin/login` | Login admin email+password | No (tapi hanya admin bisa lanjut) |
| GET | `/admin` | Dashboard: tabel 100 terbaru + link jawab per question | Yes (admin, redirect jika bukan) |

### 3.2 API Controllers (dipanggil fetch dari View, logic di `controllers/`)
| Method | Path / Action | Description | Auth |
|--------|---------------|-------------|------|
| POST | `/api/ask` → `askController.createQuestion({nama, isi, category_slug})` | Buat question. Validasi nama 2-50 + isi 10-1000 + slug ∈ 6. Rate-limit 1/menit/IP. Turnstile: verify hanya jika `TURNSTILE_SECRET_KEY` terisi, else skip. Return `{id}` | No |
| POST | `/api/reply` → `replyController.createReply({question_id, nama, isi})` | Buat reply flat (tanpa vote). Rate-limit 3/menit/IP. Set `is_admin=true` otomatis jika `isAdmin()`. Return `{id}` | No (badge otomatis jika admin login) |
| POST | `/api/vote` → `voteController.addVote({question_id})` | Vote question. `voter_hash=sha256(IP\|UA)`, unique guard → 409 "Sudah vote". Rate-limit 10/menit/IP. Return `{vote_count}` | No |
| action | `adminController.setOfficial(questionId, replyId)` | Unset resmi lama + set baru + `questions.is_answered=true` (1 transaksi) | Yes |
| action | `adminController.setPin(questionId, pinned)` | Toggle pin (pin selalu di atas) | Yes |
| action | `adminController.setCategory(questionId, slug)` | Pindah kategori (koreksi salah kamar) | Yes |
| action | `adminController.removeQuestion(questionId)` | Hapus question (cascade replies+votes) | Yes |
| action | `adminController.removeReply(replyId)` | Hapus reply spam manual | Yes |

### 3.3 Kontrak Request/Response (ringkas — detail di implementasi)
- `POST /api/ask {nama, isi, category_slug} → 200 {id} | 400 validasi | 429 rate-limit`
- `POST /api/reply {question_id, nama, isi} → 200 {id} | 400 | 429`
- `POST /api/vote {question_id} → 200 {vote_count} | 409 sudah vote | 429`
- Gagal validasi berbahasa Indonesia ("Nama minimal 2 karakter", "Terlalu cepat, tunggu 1 menit").
- XSS: escape di render (React default) + trim + maxLength client & server.

### 3.4 Realtime Channels (Supabase)
- `board`: `questions(*)` + `votes(*)` → reload list (vote count live).
- `detail-<questionId>`: `replies(question_id=eq.<id>)` → append reply live.
- Tanpa websocket custom; cleanup `removeChannel` on unmount.

### 3.5 Theming & Style Guide (brand ADIKARA — locked 2026-10-08)

Token resmi (wajib dipakai di `app/globals.css`, jangan hardcode hex di komponen):

```css
:root {
    --background: #fff;
    --foreground: #10142b;
    --adikara-red: #c9070f;
    --adikara-dark-red: #a90009;
    --pattern-pink: #f9dfe1;
    --font-family-sans: var(--font-google-sans), "Google Sans", "Product Sans", Arial, sans-serif;
    --section-space: 80px;
    --section-space-mobile: 52px;
}
```

Aturan pakai:
- Background halaman: `var(--background)`; teks utama: `var(--foreground)`.
- Aksi primer (kirim, vote aktif, badge ADMIN, jawaban resmi border): `var(--adikara-red)`; hover/active: `var(--adikara-dark-red)`.
- Pattern/dekorasi section: `var(--pattern-pink)` (jangan untuk teks).
- Font: `var(--font-family-sans)` (load Google Sans via `next/font/google`, fallback Product Sans → Arial).
- Jarak section: `var(--section-space)` desktop, `var(--section-space-mobile)` ≤640px (media query di `globals.css`).
- `views/` dilarang hardcode `#c9070f`/`#10142b` — selalu via variable agar gampang rebrand.

---

## BAGIAN 4: Alur Logika & Business Rules

> Arsitektur: User → View (`app/` + `views/`) → Controller (`controllers/` via `/api/*` atau server action) → Model (`models/` query Supabase) → DB. Auth hanya dibahas untuk admin (publik anon).

**Alur Bertanya (publik anon):**
1. User isi AskForm (nama + kategori saran + isi) → client cek kosong + maxLength.
2. `POST /api/ask` → `askController.createQuestion()`: trim → `validateNama/validateIsi` → cek slug ∈ 6 → `checkRate(ask:IP, 1, 60s)` → (opsional Turnstile jika key ada).
3. `models/question.create()` insert → return `{id}` → View reload + Realtime `board` push ke semua tab.
4. Gagal → 400 pesan ID / 429 "tunggu 1 menit"; sukses langsung tampil tanpa moderasi.

**Alur Vote (pointing publik):**
1. User klik ▲ di `VoteButton` → cek `localStorage voted:<id>` (guard cepat).
2. `POST /api/vote` → `voteController.addVote()`: `hashVoter(IP, UA)` → `models/vote.addVote()` insert unique.
3. Sukses → trigger `bump_vote()` → return `{vote_count}` → client set `localStorage` + update count + Realtime ke semua tab. Double → 409 "Sudah vote".

**Alur Reply + Jawaban Resmi:**
1. User/Admin isi ReplyForm di `/q/[id]` → `POST /api/reply` → `replyController.createReply()`: validasi + rate-limit 3/menit → `isAdmin()`? `is_admin=true` : false → insert.
2. Realtime `detail-<id>` append flat kronologis (tanpa vote, tanpa nesting).
3. Admin jadikan resmi → `adminController.setOfficial()`: dalam 1 transaksi unset `is_official` lama + set baru + `questions.is_answered=true` → Detail highlight hijau di atas, Board badge Terjawab.
4. Ganti jawaban resmi → yang lama turun jadi reply admin biasa (tidak dihapus).

**Alur Klasifikasi + Pin + Moderasi (admin):**
1. Admin login `/admin/login` (Supabase Auth) → `/admin` guard `isAdmin()` else redirect.
2. Pin: `setPin(id, true)` → Board order `is_pinned desc` selalu di atas semua sort.
3. Pindah kategori: `setCategory(id, slug)` → badge + filter ikut berubah realtime.
4. Hapus spam: `removeReply()` / `removeQuestion()` (cascade replies+votes) → hilang dari publik. Tanpa edit, tanpa ban, tanpa report di MVP.

**Alur Board (baca):**
1. `BoardView` load 100 terbaru via `models/question.list()` (join categories) → filter client (kategori + search) + sort (Top Vote/Terbaru, pinned selalu atas).
2. Subscribe channel `board` (questions + votes) → reload otomatis <3s. Copy-link `/q/[id]` untuk share WA.

### Business Rules (dari PRD + locked scope)
- Publik tanpa login; nama 2-50 char, isi question 10-1000 char, isi reply 2-1000 char.
- 1 vote per browser per question (localStorage) + per hash (server unique); reply tanpa vote.
- Reply flat 1 level, langsung tampil, badge ADMIN vs Peserta.
- Max 1 `is_official=true` per question; set resmi otomatis `is_answered=true`.
- Pinned selalu di atas; menghapus question menghapus replies+votes (cascade).
- Rate-limit: ask 1/menit/IP, reply 3/menit/IP, vote 10/menit/IP. Turnstile best-effort (skip jika key kosong).
- Bahasa Indonesia, mobile-first, timezone Asia/Jakarta.

---

## BAGIAN 5: Keamanan, Performa, & Deployment

### Keamanan (Next.js + Supabase + anon publik)
- RLS enforced: publik hanya SELECT + INSERT (questions/replies/votes); UPDATE/DELETE hanya `auth.uid() ∈ admins`. Anon key di client aman karena RLS.
- Admin: Supabase Auth email+password (placeholder `admin@example.com`, real email menyusul) + `isAdmin()` guard di `/admin` + RLS. Logout via Supabase dashboard/client.
- Anti-abuse anon: `sha256(IP|UA)` unique per question (409 jika double) + `localStorage` guard + in-memory `checkRate` (ask 1/menit, reply 3/menit, vote 10/menit per IP). Turnstile best-effort: verify hanya jika `TURNSTILE_SECRET_KEY` terisi.
- Input: trim + panjang (nama 2-50, isi 10/2-1000) di client & server; render via React (auto-escape, tanpa `dangerouslySetInnerHTML`); slug di-whitelist 6 kategori.
- HTTPS/HSTS via Vercel default; env secret hanya di server (`TURNSTILE_SECRET_KEY` tanpa prefix `NEXT_PUBLIC_`).

### Performa (target event mobile 4G)
- Board load <2s: `limit(100)` + index `(category_id, is_pinned, created_at)` + filter/search/sort di client (tanpa query ulang).
- Realtime incremental: channel `board` + `detail-<id>`, cleanup `removeChannel` on unmount; tidak ada polling.
- `npm run build` harus 0 type error (TS strict); `npx vitest run` hijau untuk `models/validation` + controllers pure.
- Tanpa upload file, tanpa image optimization, tanpa Redis di MVP — jaga bundle kecil.

### Deployment (Vercel + Supabase)
- Vercel: import repo → env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (user kirim) → Deploy. Preview per PR, production `main`.
- Supabase: paste `supabase/schema.sql` di SQL editor → cek 6 kategori → buat 2 user Auth → insert `user_id` ke `admins` → aktifkan Realtime untuk `questions, replies, votes`.
- Checklist event: QR `/` + contoh `/q/[id]`, uji tanya/vote/reply dari HP, uji double-vote → 409, uji spam cepat → 429, uji hapus spam + set resmi.

### Development Setup
```bash
npm install
# isi .env.local (placeholder, keys asli menyusul dari user):
# NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
npm run dev        # http://localhost:3000
npx vitest run     # unit test lib/models/controllers
npm run build      # gate sebelum deploy
```

**🎉 Tech Spec selesai!**

## 🔄 Finalisasi
1. **Simpan file:** `.agents/2-TECH-SPEC.md` ✅ (sudah tersimpan)
2. **Lanjut ke Task Generator:** ketik `"Buat Task berdasarkan Tech Spec yang sudah dibuat"`
3. Pipeline: `brainstorming ✅ → mini-prd ✅ → writing-plans ✅ → write-tech-spec ✅ → create-issues → implement-task → verify → finishing-a-branch`
