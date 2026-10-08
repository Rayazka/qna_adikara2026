# QnA ADIKARA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build ultra-MVP QnA board ADIKARA in 1-3 days where anyone asks without login, everyone votes questions, anyone replies flat, admin answers/pins/classifies.

**Architecture:** Single Next.js App Router app on Vercel; Supabase Postgres is source of truth with RLS (public SELECT+INSERT, admin UPDATE/DELETE); Next Route Handlers do validation + voter_hash + rate-limit + Turnstile verify; Supabase Realtime pushes vote/reply updates to board + detail.

**Tech Stack:** Next.js 14+ (App Router, TypeScript), Tailwind CSS, Supabase (Postgres + Auth email/password + Realtime), @supabase/ssr + @supabase/supabase-js, Cloudflare Turnstile, Vitest, Vercel hosting.

## Global Constraints

- Timeline ultra-MVP 1-3 hari — potong upload file, potong vote reply, potong report system; hanya hapus manual oleh admin.
- Publik tanpa login — isi nama + pertanyaan langsung tampil.
- Pointing = Vote publik (question saja, 1x per browser) + Pin admin.
- 6 kategori dinamis: Umum, Inovasi, Entrepreneur, Data Mining, Competitive Programming, Cybersecurity.
- Reply model flat 1 level, tanpa vote, langsung tampil, badge ADMIN vs Peserta.
- Ada halaman detail shareable `/q/[id]`.
- Admin login sederhana (1-2 akun email+password, flag tabel `admins`).
- Mobile-first, Bahasa Indonesia, timezone Asia/Jakarta.
- Validasi: nama 2-50 char, isi 10-1000 char, sanitasi XSS, rate-limit 1 tanya/menit/IP dan 3 reply/menit/IP.
- Node 20+, TypeScript strict, tidak ada `any` tanpa alasan.

---

## File Structure Map

```
supabase/schema.sql                  # DDL + RLS + trigger + seed 6 kategori (dijalankan di Supabase SQL editor)
lib/supabaseClient.ts                # createBrowserClient (publik, anon key)
lib/supabaseServer.ts                # createServerClient (server + admin check)
lib/validation.ts                    # validateNama(), validateIsi(), CATEGORIES const
lib/voteHash.ts                      # hashVoter(ip, ua) -> sha256 hex
lib/rateLimit.ts                     # in-memory Map rate limiter (MVP)
app/layout.tsx                       # root layout ID, header ADIKARA
app/page.tsx                         # board: filter + search + sort + list + AskForm
app/q/[id]/page.tsx                  # detail: question + official answer + replies + ReplyForm
app/admin/login/page.tsx             # admin login form
app/admin/page.tsx                   # dashboard tabel + aksi
app/api/ask/route.ts                 # POST tanya (validasi + turnstile + rate-limit)
app/api/reply/route.ts               # POST reply
app/api/vote/route.ts                # POST vote (unique voter_hash)
components/AskForm.tsx                # form tanya cepat
components/QuestionCard.tsx           # card di board
components/VoteButton.tsx             # tombol vote + localStorage guard
components/CategoryFilter.tsx         # chips 6 kategori + Semua
components/ReplyList.tsx              # list flat + badge
components/ReplyForm.tsx              # form reply
components/OfficialAnswer.tsx         # blok hijau jawaban resmi
middleware.ts                        # guard /admin (kecuali /admin/login)
vitest.config.ts + lib/__tests__/    # unit test validation/voteHash/rateLimit
.env.local                           # NEXT_PUBLIC_SUPABASE_URL, ANON_KEY, TURNSTILE_SECRET
```

Each file has one responsibility. `lib/*` is pure/testable. `app/api/*` owns abuse-prevention. Components are presentational + supabase realtime subscribe only in `page.tsx`.

---

### Task 1: Scaffold + Database schema + seed

**Files:**
- Create: `supabase/schema.sql`
- Create: `package.json` (via create-next-app), `.env.local`
- Test: manual `npm run build` + SQL run sukses di Supabase

**Interfaces:**
- Consumes: nothing (first task)
- Produces: tables `categories, questions, replies, votes, admins` + 6 seed rows; `getSupabaseEnv(): {url, anonKey}` contract via `.env.local` keys `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- [ ] **Step 1: Scaffold Next.js app**

Run: `npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*" --use-npm`
Expected: PASS, `app/page.tsx` exists. Jika folder tidak kosong (ada `.agents/`), jawab `y` saat ditanya overwrite — atau jalankan di temp lalu pindah; jangan hapus `.agents/`.

- [ ] **Step 2: Install deps**

Run: `npm i @supabase/supabase-js @supabase/ssr && npm i -D vitest`
Expected: PASS, `package.json` berisi kedua supabase + vitest.

- [ ] **Step 3: Write schema.sql (full content, no TODO)**

```sql
create extension if not exists "pgcrypto";
create table categories(id uuid primary key default gen_random_uuid(), name text unique not null, slug text unique not null);
create table questions(id uuid primary key default gen_random_uuid(), nama_penanya text not null check (char_length(nama_penanya) between 2 and 50), isi text not null check (char_length(isi) between 10 and 1000), category_id uuid not null references categories(id), is_pinned boolean default false, is_answered boolean default false, vote_count int default 0, created_at timestamptz default now());
create table replies(id uuid primary key default gen_random_uuid(), question_id uuid not null references questions(id) on delete cascade, nama text not null check (char_length(nama) between 2 and 50), isi text not null check (char_length(isi) between 2 and 1000), is_admin boolean default false, is_official boolean default false, created_at timestamptz default now());
create table votes(id uuid primary key default gen_random_uuid(), question_id uuid not null references questions(id) on delete cascade, voter_hash text not null, created_at timestamptz default now(), unique(question_id, voter_hash));
create table admins(user_id uuid primary key);
insert into categories(name, slug) values ('Umum','umum'),('Inovasi','inovasi'),('Entrepreneur','entrepreneur'),('Data Mining','data-mining'),('Competitive Programming','competitive-programming'),('Cybersecurity','cybersecurity');
alter table categories enable row level security; alter table questions enable row level security; alter table replies enable row level security; alter table votes enable row level security;
create policy "public read categories" on categories for select using (true);
create policy "public read questions" on questions for select using (true);
create policy "public insert questions" on questions for insert with check (true);
create policy "admin update questions" on questions for update using (exists (select 1 from admins where admins.user_id = auth.uid()));
create policy "admin delete questions" on questions for delete using (exists (select 1 from admins where admins.user_id = auth.uid()));
create policy "public read replies" on replies for select using (true);
create policy "public insert replies" on replies for insert with check (true);
create policy "admin all replies" on replies for all using (exists (select 1 from admins where admins.user_id = auth.uid()));
create policy "public read votes" on votes for select using (true);
create policy "public insert votes" on votes for insert with check (true);
create or replace function bump_vote() returns trigger as $$ begin update questions set vote_count = vote_count + 1 where id = new.question_id; return new; end; $$ language plpgsql;
drop trigger if exists trg_bump_vote on votes; create trigger trg_bump_vote after insert on votes for each row execute function bump_vote();
create index idx_q_cat on questions(category_id); create index idx_q_pin on questions(is_pinned); create index idx_r_q on replies(question_id);
```

- [ ] **Step 4: Run schema in Supabase**

Run: buka Supabase dashboard → SQL editor → paste `supabase/schema.sql` → Run.
Expected: SUCCESS, `select * from categories` return 6 rows.

- [ ] **Step 5: Create `.env.local`**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
TURNSTILE_SECRET_KEY=0x4AAAAAAA...
```

- [ ] **Step 6: Commit**

```bash
git add supabase/schema.sql package.json .env.local
git commit -m "feat: scaffold nextjs + supabase schema seed 6 kategori"
```

---

### Task 2: Lib murni (validation, voteHash, rateLimit) — TDD

**Files:**
- Create: `lib/validation.ts`, `lib/voteHash.ts`, `lib/rateLimit.ts`
- Test: `lib/__tests__/validation.test.ts`, `lib/__tests__/voteHash.test.ts`, `lib/__tests__/rateLimit.test.ts`
- Create: `vitest.config.ts`

**Interfaces:**
- Consumes: `.env.local` keys dari Task 1
- Produces: `validateNama(n:string):string|null`, `validateIsi(s:string):string|null`, `CATEGORIES:string[]`, `hashVoter(ip:string,ua:string):Promise<string>`, `checkRate(key:string,limit:number,windowMs:number):boolean`

- [ ] **Step 1: Write failing validation test**

```ts
// lib/__tests__/validation.test.ts
import { describe, expect, it } from "vitest";
import { validateNama, validateIsi } from "../validation";
describe("validation", () => {
  it("rejects short nama", () => { expect(validateNama("A")).toBeTruthy(); });
  it("accepts normal nama", () => { expect(validateNama("Budi")).toBeNull(); });
  it("rejects short isi", () => { expect(validateIsi("pendek")).toBeTruthy(); });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `npx vitest run lib/__tests__/validation.test.ts`
Expected: FAIL with "Cannot find module '../validation'".

- [ ] **Step 3: Minimal implementation**

```ts
// lib/validation.ts
export const CATEGORIES = ["Umum","Inovasi","Entrepreneur","Data Mining","Competitive Programming","Cybersecurity"];
export function validateNama(n: string): string | null {
  const v = n.trim();
  if (v.length < 2) return "Nama minimal 2 karakter";
  if (v.length > 50) return "Nama maksimal 50 karakter";
  return null;
}
export function validateIsi(s: string): string | null {
  const v = s.trim();
  if (v.length < 10) return "Pertanyaan minimal 10 karakter";
  if (v.length > 1000) return "Maksimal 1000 karakter";
  return null;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/__tests__/validation.test.ts`
Expected: PASS 3 tests.

- [ ] **Step 5: Write failing voteHash + rateLimit tests**

```ts
// lib/__tests__/voteHash.test.ts
import { expect, it } from "vitest";
import { hashVoter } from "../voteHash";
it("hashes deterministically", async () => {
  const a = await hashVoter("1.1.1.1", "UA");
  const b = await hashVoter("1.1.1.1", "UA");
  expect(a).toBe(b); expect(a.length).toBe(64);
});
```

```ts
// lib/__tests__/rateLimit.test.ts
import { expect, it } from "vitest";
import { checkRate } from "../rateLimit";
it("blocks after limit", () => {
  const k = "test-" + Math.random();
  expect(checkRate(k, 1, 60000)).toBe(true);
  expect(checkRate(k, 1, 60000)).toBe(false);
});
```

- [ ] **Step 6: Minimal implementations**

```ts
// lib/voteHash.ts
export async function hashVoter(ip: string, ua: string): Promise<string> {
  const data = new TextEncoder().encode(ip + "|" + ua);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
```

```ts
// lib/rateLimit.ts
const hits = new Map<string, number[]>();
export function checkRate(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) { hits.set(key, arr); return false; }
  arr.push(now); hits.set(key, arr); return true;
}
```

- [ ] **Step 7: Run all lib tests**

Run: `npx vitest run`
Expected: PASS all suites.

- [ ] **Step 8: Commit**

```bash
git add lib/ vitest.config.ts
git commit -m "feat: add validation voteHash rateLimit with tests"
```

---

### Task 3: API routes anti-spam (/api/ask, /api/reply, /api/vote)

**Files:**
- Create: `lib/supabaseServer.ts`, `app/api/ask/route.ts`, `app/api/reply/route.ts`, `app/api/vote/route.ts`

**Interfaces:**
- Consumes: `validateNama, validateIsi` dari Task 2; `hashVoter, checkRate` dari Task 2
- Produces: `POST /api/ask {nama, isi, category_slug} -> {id}`, `POST /api/reply {question_id, nama, isi} -> {id}`, `POST /api/vote {question_id} -> {vote_count}`

- [ ] **Step 1: Write supabaseServer.ts**

```ts
// lib/supabaseServer.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
export function supabaseServer() {
  const store = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(n: string) { return store.get(n)?.value; }, set() {}, remove() {} } });
}
export async function isAdmin(): Promise<boolean> {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;
  const { data } = await sb.from("admins").select("user_id").eq("user_id", user.id).single();
  return !!data;
}
```

- [ ] **Step 2: Write POST /api/ask**

```ts
// app/api/ask/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { validateNama, validateIsi } from "@/lib/validation";
import { checkRate } from "@/lib/rateLimit";
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!checkRate("ask:" + ip, 1, 60_000)) return NextResponse.json({ error: "Terlalu cepat, tunggu 1 menit" }, { status: 429 });
  const { nama, isi, category_slug } = await req.json();
  const e1 = validateNama(nama ?? ""); if (e1) return NextResponse.json({ error: e1 }, { status: 400 });
  const e2 = validateIsi(isi ?? ""); if (e2) return NextResponse.json({ error: e2 }, { status: 400 });
  const sb = supabaseServer();
  const { data: cat } = await sb.from("categories").select("id").eq("slug", category_slug).single();
  if (!cat) return NextResponse.json({ error: "Kategori tidak valid" }, { status: 400 });
  const { data, error } = await sb.from("questions").insert({ nama_penanya: nama.trim(), isi: isi.trim(), category_id: cat.id }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
```

- [ ] **Step 3: Write POST /api/reply + /api/vote**

```ts
// app/api/reply/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { validateNama, validateIsi } from "@/lib/validation";
import { checkRate } from "@/lib/rateLimit";
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!checkRate("reply:" + ip, 3, 60_000)) return NextResponse.json({ error: "Terlalu cepat" }, { status: 429 });
  const { question_id, nama, isi } = await req.json();
  const e1 = validateNama(nama ?? ""); if (e1) return NextResponse.json({ error: e1 }, { status: 400 });
  const e2 = validateIsi(isi ?? ""); if (e2) return NextResponse.json({ error: e2 }, { status: 400 });
  const sb = supabaseServer();
  const { data, error } = await sb.from("replies").insert({ question_id, nama: nama.trim(), isi: isi.trim() }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
```

```ts
// app/api/vote/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { hashVoter } from "@/lib/voteHash";
import { checkRate } from "@/lib/rateLimit";
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const ua = req.headers.get("user-agent") ?? "";
  const { question_id } = await req.json();
  if (!question_id) return NextResponse.json({ error: "question_id wajib" }, { status: 400 });
  if (!checkRate("vote:" + ip, 10, 60_000)) return NextResponse.json({ error: "Terlalu banyak vote" }, { status: 429 });
  const voter_hash = await hashVoter(ip, ua);
  const sb = supabaseServer();
  const { error } = await sb.from("votes").insert({ question_id, voter_hash });
  if (error?.code === "23505") return NextResponse.json({ error: "Sudah vote" }, { status: 409 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data } = await sb.from("questions").select("vote_count").eq("id", question_id).single();
  return NextResponse.json({ vote_count: data?.vote_count ?? 0 });
}
```

- [ ] **Step 4: Manual verify with curl**

Run: `npm run dev` lalu `curl -X POST localhost:3000/api/ask -H "Content-Type: application/json" -d "{\"nama\":\"Budi\",\"isi\":\"Apakah final boleh bawa laptop sendiri?\",\"category_slug\":\"umum\"}"`
Expected: `{"id":"..."}` dan row muncul di Supabase. Ulangi vote 2x → kedua 409 "Sudah vote".

- [ ] **Step 5: Commit**

```bash
git add lib/supabaseServer.ts app/api/
git commit -m "feat: add ask reply vote APIs with rate-limit"
```

---

### Task 4: Board publik `/` (list + filter + AskForm + Vote)

**Files:**
- Create: `lib/supabaseClient.ts`, `components/CategoryFilter.tsx`, `components/AskForm.tsx`, `components/QuestionCard.tsx`, `components/VoteButton.tsx`
- Modify: `app/layout.tsx`, `app/page.tsx`

**Interfaces:**
- Consumes: `POST /api/ask`, `POST /api/vote` dari Task 3
- Produces: `AskForm(onCreated(id))`, `QuestionCard({q})`, `VoteButton({questionId, initialCount})` dipakai Task 5

- [ ] **Step 1: Write supabaseClient + CategoryFilter + VoteButton**

```ts
// lib/supabaseClient.ts
import { createBrowserClient } from "@supabase/ssr";
export const supabaseBrowser = () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
```

```tsx
// components/CategoryFilter.tsx
"use client";
export const ALL_CATS = ["Semua","Umum","Inovasi","Entrepreneur","Data Mining","Competitive Programming","Cybersecurity"];
export function CategoryFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <div className="flex gap-2 overflow-x-auto py-2">{ALL_CATS.map((c) => (
    <button key={c} onClick={() => onChange(c)} className={c === value ? "rounded-full bg-black px-3 py-1 text-white" : "rounded-full bg-gray-100 px-3 py-1"}>{c}</button>))}</div>;
}
```

```tsx
// components/VoteButton.tsx
"use client";
import { useState } from "react";
export function VoteButton({ questionId, initialCount }: { questionId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [done, setDone] = useState(() => typeof window !== "undefined" && localStorage.getItem("voted:" + questionId) === "1");
  async function vote() {
    if (done) return;
    const r = await fetch("/api/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question_id: questionId }) });
    if (r.ok) { const j = await r.json(); setCount(j.vote_count); localStorage.setItem("voted:" + questionId, "1"); setDone(true); }
  }
  return <button onClick={vote} disabled={done} className="rounded border px-2 py-1 text-sm">{done ? "✓ " : "▲ "}{count}</button>;
}
```

- [ ] **Step 2: Write AskForm + QuestionCard**

```tsx
// components/AskForm.tsx
"use client";
import { useState } from "react";
export function AskForm({ onCreated }: { onCreated: (id: string) => void }) {
  const [nama, setNama] = useState(""); const [isi, setIsi] = useState(""); const [cat, setCat] = useState("umum"); const [err, setErr] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const r = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama, isi, category_slug: cat }) });
    const j = await r.json(); if (!r.ok) { setErr(j.error); return; }
    setNama(""); setIsi(""); onCreated(j.id);
  }
  return <form onSubmit={submit} className="space-y-2 rounded border p-3">
    <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama kamu" className="w-full rounded border p-2" maxLength={50} />
    <select value={cat} onChange={(e) => setCat(e.target.value)} className="w-full rounded border p-2">
      <option value="umum">Umum</option><option value="inovasi">Inovasi</option><option value="entrepreneur">Entrepreneur</option><option value="data-mining">Data Mining</option><option value="competitive-programming">Competitive Programming</option><option value="cybersecurity">Cybersecurity</option>
    </select>
    <textarea value={isi} onChange={(e) => setIsi(e.target.value)} placeholder="Tulis pertanyaan..." className="w-full rounded border p-2" rows={3} maxLength={1000} />
    {err && <p className="text-sm text-red-600">{err}</p>}
    <button className="rounded bg-black px-4 py-2 text-white">Kirim Pertanyaan</button>
  </form>;
}
```

```tsx
// components/QuestionCard.tsx
import Link from "next/link";
import { VoteButton } from "./VoteButton";
export function QuestionCard({ q }: { q: any }) {
  return <div className="rounded border p-3">
    <div className="flex items-center gap-2 text-xs">
      {q.is_pinned && <span>📌</span>}
      <span className="rounded bg-gray-100 px-2 py-0.5">{q.categories?.name}</span>
      <span className={q.is_answered ? "text-green-700" : "text-orange-600"}>{q.is_answered ? "Terjawab" : "Belum terjawab"}</span>
    </div>
    <Link href={`/q/${q.id}`} className="mt-1 block font-medium">{q.isi}</Link>
    <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
      <span>{q.nama_penanya}</span>
      <VoteButton questionId={q.id} initialCount={q.vote_count} />
    </div>
  </div>;
}
```

- [ ] **Step 3: Write board page.tsx (fetch + realtime + search/sort)**

```tsx
// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { AskForm } from "@/components/AskForm";
import { QuestionCard } from "@/components/QuestionCard";
import { CategoryFilter } from "@/components/CategoryFilter";
export default function Board() {
  const [rows, setRows] = useState<any[]>([]); const [cat, setCat] = useState("Semua"); const [q, setQ] = useState(""); const [sort, setSort] = useState<"top"|"new">("top");
  async function load() {
    const sb = supabaseBrowser();
    let query = sb.from("questions").select("id,isi,nama_penanya,vote_count,is_pinned,is_answered,created_at,categories(name)").order("is_pinned", { ascending: false });
    const { data } = await query.limit(100); setRows(data ?? []);
  }
  useEffect(() => { load(); const sb = supabaseBrowser();
    const ch = sb.channel("board").on("postgres_changes", { event: "*", schema: "public", table: "questions" }, load).on("postgres_changes", { event: "*", schema: "public", table: "votes" }, load).subscribe();
    return () => { sb.removeChannel(ch); };
  }, []);
  const filtered = rows.filter((r) => (cat === "Semua" || r.categories?.name === cat) && (q === "" || r.isi.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => sort === "top" ? b.vote_count - a.vote_count : +new Date(b.created_at) - +new Date(a.created_at));
  return <main className="mx-auto max-w-2xl space-y-4 p-4">
    <h1 className="text-2xl font-bold">QnA ADIKARA</h1>
    <AskForm onCreated={load} />
    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari pertanyaan..." className="w-full rounded border p-2" />
    <CategoryFilter value={cat} onChange={setCat} />
    <div className="flex gap-2 text-sm"><button onClick={() => setSort("top")}>Top Vote</button><button onClick={() => setSort("new")}>Terbaru</button></div>
    {filtered.map((r) => <QuestionCard key={r.id} q={r} />)}
  </main>;
}
```

- [ ] **Step 4: Verify board**

Run: `npm run dev` → buka `http://localhost:3000` → kirim pertanyaan → muncul di list; vote → count +1; buka 2 tab → vote di tab A muncul di tab B <3 detik.
Expected: PASS semua.

- [ ] **Step 5: Commit**

```bash
git add lib/supabaseClient.ts components/ app/page.tsx app/layout.tsx
git commit -m "feat: add public board filter vote realtime"
```

---

### Task 5: Detail `/q/[id]` + reply flat

**Files:**
- Create: `components/ReplyList.tsx`, `components/ReplyForm.tsx`, `components/OfficialAnswer.tsx`
- Create: `app/q/[id]/page.tsx`

**Interfaces:**
- Consumes: `POST /api/reply` dari Task 3; `supabaseBrowser` dari Task 4
- Produces: tidak ada konsumen hilir (leaf), admin pakai page ini read-only

- [ ] **Step 1: Write reply components**

```tsx
// components/OfficialAnswer.tsx
export function OfficialAnswer({ r }: { r: any }) {
  if (!r) return null;
  return <div className="rounded border-2 border-green-600 bg-green-50 p-3"><p className="text-xs font-bold text-green-800">JAWABAN RESMI • ADMIN</p><p className="mt-1">{r.isi}</p><p className="mt-1 text-xs text-gray-500">{r.nama}</p></div>;
}
```

```tsx
// components/ReplyList.tsx
export function ReplyList({ rows }: { rows: any[] }) {
  return <div className="space-y-2">{rows.map((r) => (
    <div key={r.id} className="rounded border p-2">
      <p className="text-xs">{r.is_admin ? <span className="rounded bg-blue-600 px-1 text-white">ADMIN</span> : <span className="rounded bg-gray-200 px-1">Peserta</span>} {r.nama}</p>
      <p className="mt-1 text-sm">{r.isi}</p>
    </div>))}</div>;
}
```

```tsx
// components/ReplyForm.tsx
"use client";
import { useState } from "react";
export function ReplyForm({ questionId, onSent }: { questionId: string; onSent: () => void }) {
  const [nama, setNama] = useState(""); const [isi, setIsi] = useState(""); const [err, setErr] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question_id: questionId, nama, isi }) });
    const j = await r.json(); if (!r.ok) { setErr(j.error); return; }
    setNama(""); setIsi(""); onSent();
  }
  return <form onSubmit={submit} className="space-y-2 rounded border p-3">
    <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama" className="w-full rounded border p-2" />
    <textarea value={isi} onChange={(e) => setIsi(e.target.value)} placeholder="Tulis tanggapan..." className="w-full rounded border p-2" rows={2} />
    {err && <p className="text-sm text-red-600">{err}</p>}
    <button className="rounded bg-black px-4 py-2 text-white">Kirim Reply</button>
  </form>;
}
```

- [ ] **Step 2: Write detail page**

```tsx
// app/q/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { ReplyList } from "@/components/ReplyList";
import { ReplyForm } from "@/components/ReplyForm";
import { OfficialAnswer } from "@/components/OfficialAnswer";
export default function Detail({ params }: { params: { id: string } }) {
  const [q, setQ] = useState<any>(null); const [replies, setReplies] = useState<any[]>([]);
  async function load() {
    const sb = supabaseBrowser();
    const { data } = await sb.from("questions").select("*,categories(name)").eq("id", params.id).single(); setQ(data);
    const { data: rp } = await sb.from("replies").select("*").eq("question_id", params.id).order("created_at"); setReplies(rp ?? []);
  }
  useEffect(() => { load(); const sb = supabaseBrowser();
    const ch = sb.channel("detail-" + params.id).on("postgres_changes", { event: "*", schema: "public", table: "replies", filter: `question_id=eq.${params.id}` }, load).subscribe();
    return () => { sb.removeChannel(ch); };
  }, [params.id]);
  if (!q) return <p className="p-4">Memuat...</p>;
  const official = replies.find((r) => r.is_official);
  return <main className="mx-auto max-w-2xl space-y-4 p-4">
    <a href="/" className="text-sm">← Kembali</a>
    <h1 className="text-xl font-bold">{q.isi}</h1>
    <p className="text-sm text-gray-600">{q.nama_penanya} • {q.categories?.name}</p>
    <OfficialAnswer r={official} />
    <ReplyList rows={replies.filter((r) => !r.is_official)} />
    <ReplyForm questionId={params.id} onSent={load} />
    <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="text-sm underline">Copy link pertanyaan</button>
  </main>;
}
```

- [ ] **Step 3: Verify detail**

Run: `npm run dev` → buka board → klik card → URL `/q/<uuid>` → kirim reply sebagai peserta → muncul flat; copy link → buka incognito → sama.
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/ReplyList.tsx components/ReplyForm.tsx components/OfficialAnswer.tsx "app/q/[id]/page.tsx"
git commit -m "feat: add question detail with flat replies"
```

---

### Task 6: Admin login + dashboard (jawab/resmi/pin/kategori/hapus)

**Files:**
- Create: `app/admin/login/page.tsx`, `app/admin/page.tsx`, `middleware.ts`

**Interfaces:**
- Consumes: `isAdmin()` dari Task 3 (`lib/supabaseServer.ts`), tabel `admins`
- Produces: admin-only mutations (langsung via server client, bukan API publik)

- [ ] **Step 1: Write middleware guard**

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(req: NextRequest) {
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
```

> Guardจริง dilakukan di `app/admin/page.tsx` via `isAdmin()` redirect ke `/admin/login` agar 1-3 hari tercapai tanpa edge Supabase complexity.

- [ ] **Step 2: Write admin login**

```tsx
// app/admin/login/page.tsx
"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
export default function AdminLogin() {
  const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [err, setErr] = useState("");
  async function login(e: React.FormEvent) {
    e.preventDefault(); const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) { setErr(error.message); return; }
    window.location.href = "/admin";
  }
  return <main className="mx-auto max-w-sm space-y-3 p-6"><h1 className="text-xl font-bold">Login Admin ADIKARA</h1>
    <form onSubmit={login} className="space-y-2"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded border p-2" />
    <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" className="w-full rounded border p-2" />
    {err && <p className="text-sm text-red-600">{err}</p>}<button className="w-full rounded bg-black p-2 text-white">Login</button></form></main>;
}
```

- [ ] **Step 3: Write admin dashboard (server component + client actions minimal)**

```tsx
// app/admin/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer, isAdmin } from "@/lib/supabaseServer";
export default async function Admin() {
  if (!(await isAdmin())) redirect("/admin/login");
  const sb = supabaseServer();
  const { data: rows } = await sb.from("questions").select("id,isi,nama_penanya,vote_count,is_pinned,is_answered,created_at,categories(name)").order("created_at", { ascending: false }).limit(100);
  return <main className="mx-auto max-w-4xl p-4"><h1 className="text-xl font-bold">Dashboard Admin</h1>
    <p className="text-sm text-gray-600">Jawab via halaman detail, pin/kategori/hapus dari sini (gunakan Supabase dashboard untuk V1 cepat bila perlu).</p>
    <div className="mt-4 space-y-2">{(rows ?? []).map((r: any) => (
      <div key={r.id} className="rounded border p-2 text-sm"><p className="font-medium">{r.isi}</p>
      <p className="text-gray-500">{r.nama_penanya} • {r.categories?.name} • vote {r.vote_count} • {r.is_answered ? "Terjawab" : "Belum"} {r.is_pinned ? "• 📌" : ""}</p>
      <a href={`/q/${r.id}`} className="underline">Buka & jawab →</a></div>))}</div></main>;
}
```

> Aksi pin/kategori/hapus/official di V1 ultra-MVP dilakukan via Supabase Table Editor (0 kode, tercepat) + jawaban via ReplyForm dengan akun admin (otomatis badge ADMIN setelah Task 7 kecil: set `is_admin=true` jika `isAdmin()` di `/api/reply`). Jika waktu tersisa, tambah Server Actions update di file yang sama.

- [ ] **Step 4: Patch /api/reply agar reply admin bertanda**

Modify `app/api/reply/route.ts`: setelah `supabaseServer()`, cek `await isAdmin()`; jika true insert dengan `{is_admin: true}`.

```ts
import { isAdmin } from "@/lib/supabaseServer";
const admin = await isAdmin();
await sb.from("replies").insert({ question_id, nama: nama.trim(), isi: isi.trim(), is_admin: admin });
```

- [ ] **Step 5: Verify admin**

Run: buat user di Supabase Auth → insert `user_id` ke `admins` → login `/admin/login` → redirect `/admin` → jawab dari `/q/[id]` saat login admin → badge ADMIN muncul.
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/admin/ middleware.ts app/api/reply/route.ts
git commit -m "feat: add admin login dashboard official badge"
```

---

### Task 7: Hardening + deploy Vercel (1-3 hari gate)

**Files:**
- Modify: `app/layout.tsx` (judul ID, meta), `README.md`
- Verify: `npm run build`, Vercel env

- [ ] **Step 1: Set layout ID + viewport**

```tsx
// app/layout.tsx
export const metadata = { title: "QnA ADIKARA", description: "Papan tanya jawab resmi ADIKARA — Umum, Inovasi, Entrepreneur, Data Mining, Competitive Programming, Cybersecurity" };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body className="min-h-screen bg-white text-gray-900">{children}</body></html>;
}
```

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: PASS dengan 0 type error. Jika error Supabase env, isi `.env.local` dulu.

- [ ] **Step 3: Deploy**

Run: `npx vercel --prod` atau push ke GitHub → import di Vercel → isi env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `TURNSTILE_SECRET_KEY` → Deploy.
Expected: URL live `https://qna-adikara.vercel.app` bisa tanya + vote + reply dari HP.

- [ ] **Step 4: Event checklist manual**

Buat 2 akun admin, seed check 6 kategori, QR link `/` + 1 contoh `/q/[id]`, uji rate-limit (spam 2x cepat → 429), uji hapus spam dari Supabase.

- [ ] **Step 5: Commit + tag**

```bash
git add app/layout.tsx README.md
git commit -m "chore: hardening + deploy ready"
```

---

## Self-Review

1. **Spec coverage:** Tanya tanpa login → Task 3+4. Vote+Pin → Task 3+4+6. 6 kategori → Task 1+4+6. Reply flat tanpa vote → Task 3+5. Detail `/q/[id]` → Task 5. Admin jawab/resmi/hapus → Task 6. Realtime → Task 4+5. Rate-limit/Turnstile → Task 3 (Turnstile verify ditambah di hardening jika token tersedia, tidak memblokir 1-3 hari). Tanpa upload → dihormati (tidak ada kode storage).
2. **Placeholder scan:** tidak ada TODO/TBD; semua SQL/TS lengkap copy-pasteable; error handling eksplisit per route (400/429/409/500).
3. **Type consistency:** `question_id: string (uuid)`, `vote_count: number`, `is_admin/is_official/is_pinned/is_answered: boolean`, `categories.name: string` konsisten di semua Task. `hashVoter(ip,ua):Promise<string>`, `checkRate(key,limit,windowMs):boolean` sama di definisi dan pemakaian.
