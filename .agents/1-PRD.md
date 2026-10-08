# PRD — Website QnA ADIKARA (Blueprint-Ready v2.0)

> Sumber: sesi brainstorming chat 7 Okt 2026 (locked scope) + timeline 1-3 hari.
> Stack: Next.js + Supabase. Lokasi final: `.agents/1-PRD.md`

---

## 📑 BAB 1: WHY

### BAGIAN 1 — Ringkasan Eksekutif & Visi

#### Problem Statement
ADIKARA adalah event perlombaan dengan 6 cabang (Umum, Inovasi, Entrepreneur, Data Mining, Competitive Programming, Cybersecurity). Saat ini pertanyaan peserta tersebar di WA/group/chat panitia — tidak terpusat, berulang, dan jawaban admin tenggelam. Panitia sebagai event organizer kesulitan menampung semua pertanyaan, menandai pertanyaan penting (pointing), dan mengklasifikasikan pertanyaan per cabang lomba. Peserta juga tidak bisa melihat pertanyaan orang lain beserta jawabannya.

#### Visi Produk
Menjadi papan QnA resmi ADIKARA: satu link untuk semua pertanyaan — siapa pun bisa bertanya dalam 30 detik tanpa login, melihat semua pertanyaan + jawaban resmi, dan menemukan info per cabang lomba dengan cepat. Setelah event, arsip QnA menjadi FAQ permanen.

#### Value Proposition
- **Tanya tanpa login** — isi nama + pertanyaan langsung tampil; menurunkan friksi peserta lomba.
- **Pointing ganda (Vote publik + Pin admin)** — yang populer naik, yang penting disorot admin.
- **Klasifikasi 6 cabang oleh admin** — pertanyaan salah kamar bisa dipindah ke kategori benar.
- **Halaman detail shareable per pertanyaan** — link `/q/[id]` disebar via WA/MC/pamflet + ada reply peserta flat 1 level.

#### Target Audiens
| Segmen | Deskripsi | Kebutuhan Utama |
|--------|-----------|-----------------|
| Peserta lomba | Pelajar/mahasiswa peserta 6 cabang, mobile-first | Bertanya cepat, lihat jawaban resmi, cari info cabangnya |
| Penonton / pendamping | Umum, non-peserta | Baca FAQ tanpa bertanya |
| Admin / Panitia ADIKARA | 1-2 orang EO, non-teknis | Jawab, tandai jawaban resmi, pin, pindah kategori, hapus spam |

#### Tujuan Produk
1. **Sentralisasi QnA** — Indikator: 100% pertanyaan masuk via website saat event (bukan WA).
2. **Kecepatan bertanya** — Indikator: median waktu isi form → tampil <30 detik.
3. **Kecepatan admin** — Indikator: jawab + pin + klasifikasi <1 menit per item.
4. **Keterbacaan event** — Indikator: 80% pertanyaan punya status Terjawab + jawaban resmi sebelum final.

### BAGIAN 2 — Tech Stack Overview

| Layer | Technology | Alasan Pemilihan |
|-------|------------|------------------|
| Frontend | Next.js (App Router) + Tailwind | SSR cepat, 1 codebase board + detail + admin, deploy mudah |
| Backend | Next.js Route Handlers / Server Actions | Validasi, hash voter, rate-limit tanpa server terpisah |
| Database | Supabase Postgres + Realtime | Relasional (question→reply→vote), realtime vote/jawaban, free tier cukup |
| Auth | Supabase Auth email+password (admin only) | Publik anon, hanya 1-2 admin login; flag via tabel `admins` |
| Hosting | Vercel | Native Next.js, gratis, deploy <5 menit |
| Storage | Tidak perlu (MVP teks saja) | Tanpa upload file agar 1-3 hari tercapai |
| Anti-bot | Cloudflare Turnstile | Ringan, gratis, wajib karena form anon |

#### Pertimbangan Teknis
- **Timeline 1-3 hari → ultra-MVP** — potong upload file, potong vote reply, potong report system; hanya hapus manual oleh admin.
- **Realtime (Supabase channel)** — vote count + reply baru live saat MC/peserta membuka web bersamaan.
- **Anon abuse** — voter_hash = hash(IP+UA) server-side + localStorage client + rate-limit 1 tanya/menit/IP, 3 reply/menit/IP.
- **Mobile-first** — mayoritas akses via HP di venue; board + detail harus <2s di 4G.

### BAGIAN 3 — Market & Competitor Analysis
*(Tidak diminta oleh user — skip)*

---
*(Bab 2 dan Bab 3 menyusul setelah konfirmasi `lanjut`)*
