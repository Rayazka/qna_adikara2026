# TASK LIST — QnA ADIKARA

> Acuan: `.agents/2-TECH-SPEC.md` (5 bagian, MVC) + plan `docs/superpowers/plans/2026-10-07-qna-adikara.md`
> Project baru (tanpa boilerplate) → mulai dari setup. Struktur folder MVC.
> Tanggal: 2026-10-08. Timeline ultra-MVP 1-3 hari.

---

## MODUL A: Setup Project & Database (fondasi — kerjakan pertama)

- **ID:** T-01
- **Judul:** Scaffold Next.js 14 + Tailwind + TS strict
- **Deskripsi:** Init Next.js App Router di repo (jangan hapus `.agents/` dan `docs/`), aktifkan Tailwind, alias `@/*`, `lang="id"`.
- **Modul:** Setup
- **Prioritas:** High
- **Status:** Done (Next 16.4.0 + React 19 + Tailwind v4, `npm run build` PASS 2026-10-08)
- **Dependensi:** -
- **Tanggal:** 2026-10-08
- **Estimasi:** 0.5 jam
- **File yang diubah:** `package.json`, `app/layout.tsx`, `app/globals.css`, `tsconfig.json`

- **ID:** T-02
- **Judul:** Install Supabase + Vitest deps + `.env` placeholder
- **Deskripsi:** Install `@supabase/supabase-js`, `@supabase/ssr`, `vitest`; buat `.env.local` placeholder (keys asli menyusul dari user) + `vitest.config.ts`.
- **Modul:** Setup
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-01
- **Tanggal:** 2026-10-08
- **Estimasi:** 0.5 jam
- **File yang diubah:** `package.json`, `.env.local`, `vitest.config.ts`

- **ID:** T-03
- **Judul:** Schema SQL + seed 6 kategori + RLS + trigger vote
- **Deskripsi:** Tulis `supabase/schema.sql` lengkap (5 tabel, RLS publik SELECT+INSERT / admin UPDATE+DELETE, trigger `bump_vote`, seed Umum/Inovasi/Entrepreneur/Data Mining/Competitive Programming/Cybersecurity); jalankan di Supabase SQL editor dan verifikasi 6 rows.
- **Modul:** Database
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-02
- **Tanggal:** 2026-10-08
- **Estimasi:** 1 jam
- **File yang diubah:** `supabase/schema.sql`

- **ID:** T-04
- **Judul:** Core infra `lib/` (supabaseClient/Server + voteHash + rateLimit)
- **Deskripsi:** Buat `lib/supabaseClient.ts`, `lib/supabaseServer.ts` (+`isAdmin()`), `lib/voteHash.ts` (`hashVoter`), `lib/rateLimit.ts` (`checkRate`) + unit test vitest hijau.
- **Modul:** Setup
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-02
- **Tanggal:** 2026-10-08
- **Estimasi:** 1 jam
- **File yang diubah:** `lib/supabaseClient.ts`, `lib/supabaseServer.ts`, `lib/voteHash.ts`, `lib/rateLimit.ts`, `lib/__tests__/`

- **ID:** T-05
- **Judul:** Aktifkan Realtime + buat 2 akun admin placeholder
- **Deskripsi:** Aktifkan Realtime untuk `questions,replies,votes` di Supabase; buat user Auth `admin@example.com` (+1 cadangan) dan insert `user_id` ke `admins`; verifikasi login.
- **Modul:** Database
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-03
- **Tanggal:** 2026-10-08
- **Estimasi:** 0.5 jam
- **File yang diubah:** (Supabase dashboard, tanpa file kode)

---

## MODUL B: Model Layer MVC (`models/` — satu-satunya yang query Supabase)

- **ID:** T-06
- **Judul:** `models/types.ts` + `models/validation.ts` (aturan domain)
- **Deskripsi:** Tipe `Question, Reply, Category, Vote` + `validateNama` (2-50), `validateIsi` (question 10-1000, reply 2-1000), konstanta 6 kategori + slug. Unit test vitest hijau.
- **Modul:** Model
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-04
- **Tanggal:** 2026-10-08
- **Estimasi:** 1 jam
- **File yang diubah:** `models/types.ts`, `models/validation.ts`, `lib/__tests__/` (atau `models/__tests__/`)

- **ID:** T-07
- **Judul:** `models/category.ts` + `models/question.ts` (query)
- **Deskripsi:** `listCategories(), findCategoryBySlug()`; `listQuestions(limit 100, join categories)`, `getQuestionDetail(id)`, `createQuestion({nama, isi, category_id})`, `setPin/setAnswered/setCategory/removeQuestion`. Verifikasi via `npm run dev` + Supabase table editor.
- **Modul:** Model
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-06
- **Tanggal:** 2026-10-08
- **Estimasi:** 1.5 jam
- **File yang diubah:** `models/category.ts`, `models/question.ts`

- **ID:** T-08
- **Judul:** `models/reply.ts` + `models/vote.ts` (query)
- **Deskripsi:** `listRepliesByQuestion()`, `createReply({question_id, nama, isi, is_admin})`, `setOfficial(questionId, replyId)` 1 transaksi + `removeReply()`; `addVote({question_id, voter_hash})` (andalkan unique constraint → 409) + `countByQuestion()`. Verifikasi trigger `bump_vote` increment.
- **Modul:** Model
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-06
- **Tanggal:** 2026-10-08
- **Estimasi:** 1.5 jam
- **File yang diubah:** `models/reply.ts`, `models/vote.ts`

---

## MODUL C: Controller + API (`controllers/` + `app/api/*` — tanpa JSX)

- **ID:** T-09
- **Judul:** `askController` + `POST /api/ask`
- **Deskripsi:** Orkestrasi `createQuestion(nama, isi, category_slug)`: trim → validasi → whitelist slug → `checkRate(ask:IP, 1, 60s)` → Turnstile best-effort (skip jika key kosong) → `models/question.create()` → `{id}`. Error ID: 400 validasi, 429 rate-limit, 500 DB.
- **Modul:** Controller/API
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-07
- **Tanggal:** 2026-10-08
- **Estimasi:** 1 jam
- **File yang diubah:** `controllers/askController.ts`, `app/api/ask/route.ts`

- **ID:** T-10
- **Judul:** `replyController` + `POST /api/reply`
- **Deskripsi:** Orkestrasi `createReply(question_id, nama, isi)`: validasi + rate-limit 3/menit/IP → `isAdmin()`? `is_admin=true` : false → `models/reply.create()` → `{id}`. Reply flat, tanpa vote.
- **Modul:** Controller/API
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-08
- **Tanggal:** 2026-10-08
- **Estimasi:** 1 jam
- **File yang diubah:** `controllers/replyController.ts`, `app/api/reply/route.ts`

- **ID:** T-11
- **Judul:** `voteController` + `POST /api/vote`
- **Deskripsi:** Orkestrasi `addVote(question_id, ip, ua)`: `hashVoter(IP, UA)` → `models/vote.addVote()` → unique violation → 409 "Sudah vote"; sukses return `{vote_count}` (trigger `bump_vote`). Rate-limit 10/menit/IP.
- **Modul:** Controller/API
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-08
- **Tanggal:** 2026-10-08
- **Estimasi:** 1 jam
- **File yang diubah:** `controllers/voteController.ts`, `app/api/vote/route.ts`

- **ID:** T-12
- **Judul:** `adminController` (setOfficial/pin/kategori/hapus, guard admin)
- **Deskripsi:** `setOfficial(questionId, replyId)` 1 transaksi + `setPin`, `setCategory`, `removeQuestion` (cascade), `removeReply` — semua guard `isAdmin()` di awal, throw 403 jika bukan admin. Dipakai admin View + bisa dipanggil Server Action.
- **Modul:** Controller/API
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-07, T-08
- **Tanggal:** 2026-10-08
- **Estimasi:** 1.5 jam
- **File yang diubah:** `controllers/adminController.ts`

---

## MODUL D: View Publik (board + detail + realtime — tanpa query langsung)

- **ID:** T-13
- **Judul:** Partials board (`CategoryFilter`, `VoteButton`, `QuestionCard`, `AskForm`)
- **Deskripsi:** Chips 6 kategori + Semua; `VoteButton` (localStorage guard + `POST /api/vote` + optimistic count); `QuestionCard` (badge kategori, status Terjawab/Belum, pinned 📌, preview resmi, link `/q/[id]`); `AskForm` (nama + dropdown slug + textarea + error ID). Mobile-first.
- **Modul:** View Publik
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-09, T-11
- **Tanggal:** 2026-10-08
- **Estimasi:** 2 jam
- **File yang diubah:** `views/partials/CategoryFilter.tsx`, `views/partials/VoteButton.tsx`, `views/partials/QuestionCard.tsx`, `views/partials/AskForm.tsx`

- **ID:** T-14
- **Judul:** `BoardView` + `app/page.tsx` (filter/search/sort + realtime)
- **Deskripsi:** Load 100 via Model, filter kategori + search client, sort Top Vote/Terbaru (pinned selalu atas); subscribe channel `board` (questions+votes) reload <3s; `AskForm onCreated` refresh. Header ADIKARA + CSS variables brand (default netral, swap saat logo/hex datang).
- **Modul:** View Publik
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-13
- **Tanggal:** 2026-10-08
- **Estimasi:** 1.5 jam
- **File yang diubah:** `views/BoardView.tsx`, `app/page.tsx`

- **ID:** T-15
- **Judul:** Partials detail (`OfficialAnswer`, `ReplyList`, `ReplyForm`)
- **Deskripsi:** Blok hijau jawaban resmi (badge JAWABAN RESMI • ADMIN); list flat kronologis badge ADMIN/Peserta; form reply (nama + isi + error ID) → `POST /api/reply`.
- **Modul:** View Publik
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-10
- **Tanggal:** 2026-10-08
- **Estimasi:** 1.5 jam
- **File yang diubah:** `views/partials/OfficialAnswer.tsx`, `views/partials/ReplyList.tsx`, `views/partials/ReplyForm.tsx`

- **ID:** T-16
- **Judul:** `DetailView` + `app/q/[id]/page.tsx` (shareable + realtime)
- **Deskripsi:** Question header + meta + copy-link (clipboard `window.location.href`); official di atas + replies non-official; subscribe `detail-<id>`; state loading/kosong. Verifikasi incognito + 2 tab live.
- **Modul:** View Publik
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-15
- **Tanggal:** 2026-10-08
- **Estimasi:** 1.5 jam
- **File yang diubah:** `views/DetailView.tsx`, `app/q/[id]/page.tsx`

---

## MODUL E: Admin (login + dashboard + aksi resmi/pin/kategori/hapus)

- **ID:** T-17
- **Judul:** Login admin + guard (`/admin/login`, `isAdmin`, middleware)
- **Deskripsi:** Form email+password via Supabase Auth; `/admin` server guard `isAdmin()` → redirect `/admin/login` jika bukan; `middleware.ts` matcher `/admin/:path*`. Verifikasi dengan akun placeholder `admin@example.com`.
- **Modul:** Admin
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-05, T-12
- **Tanggal:** 2026-10-08
- **Estimasi:** 1 jam
- **File yang diubah:** `app/admin/login/page.tsx`, `middleware.ts`, `lib/supabaseServer.ts`

- **ID:** T-18
- **Judul:** `AdminView` + `app/admin/page.tsx` (tabel + aksi)
- **Deskripsi:** Tabel 100 terbaru (pertanyaan, kategori, vote, reply count, status, pin, waktu) + aksi: jawab via link `/q/[id]`, jadikan resmi, toggle pin, pindah kategori dropdown, hapus question/reply → panggil `adminController`. Filter Belum Terjawab + per kategori + search.
- **Modul:** Admin
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-12, T-17
- **Tanggal:** 2026-10-08
- **Estimasi:** 2 jam
- **File yang diubah:** `views/AdminView.tsx`, `app/admin/page.tsx`

---

## MODUL F: Hardening + Theming + Deploy (terakhir)

- **ID:** T-19
- **Judul:** Theming brand ADIKARA (`globals.css` + font + Header)
- **Deskripsi:** Terapkan token locked §3.5 ke `app/globals.css` (`:root` background/foreground/adikara-red/dark-red/pattern-pink, font Google Sans via `next/font/google`, section-space 80px / 52px mobile); `views/partials/Header.tsx` pakai variable (tanpa hardcode hex); ganti aksen default (hitam/biru/hijau) ke red/dark-red — hijau jawaban resmi jadi border red + bg pattern-pink muda.
- **Modul:** Theming
- **Prioritas:** Mid
- **Status:** Todo
- **Dependensi:** T-14, T-16
- **Tanggal:** 2026-10-08
- **Estimasi:** 1.5 jam
- **File yang diubah:** `app/globals.css`, `app/layout.tsx`, `views/partials/Header.tsx`, `views/partials/*.tsx` (swap warna)

- **ID:** T-20
- **Judul:** Hardening (XSS, empty/loading/error, responsive, 404)
- **Deskripsi:** Pastikan tanpa `dangerouslySetInnerHTML`; trim + maxLength client & server; state kosong/loading/error di board + detail; 404 custom untuk `/q/[id]` tak ada; mobile 360px lolos (chips scroll, form penuh); `npm run build` 0 error + `npx vitest run` hijau.
- **Modul:** Hardening
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-14, T-16, T-18
- **Tanggal:** 2026-10-08
- **Estimasi:** 1.5 jam
- **File yang diubah:** `views/*`, `app/q/[id]/not-found.tsx`, `app/error.tsx`

- **ID:** T-21
- **Judul:** Deploy Vercel + checklist event
- **Deskripsi:** Push repo → import Vercel → isi env (`NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY` dari user) → deploy prod; verifikasi live: tanya + vote + reply + set resmi + pin dari HP; cetak QR `/` + 1 contoh `/q/[id]`; uji 429 (spam cepat) dan 409 (double vote).
- **Modul:** Deploy
- **Prioritas:** High
- **Status:** Todo
- **Dependensi:** T-20
- **Tanggal:** 2026-10-08
- **Estimasi:** 1 jam
- **File yang diubah:** (Vercel dashboard + `README.md` berisi URL live)

---

## REKAP TOTAL: 21 task (T-01 s.d. T-21), estimasi ~23 jam (~3 hari 1 dev)
