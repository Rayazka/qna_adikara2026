-- QnA ADIKARA: skema database (sumber tunggal, jalankan di Supabase SQL editor).
-- 5 tabel + RLS (publik SELECT+INSERT, admin UPDATE+DELETE) + trigger vote + seed 6 kategori.
create extension if not exists "pgcrypto";

create table categories(
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

create table questions(
  id uuid primary key default gen_random_uuid(),
  nama_penanya text not null check (char_length(nama_penanya) between 2 and 50),
  isi text not null check (char_length(isi) between 10 and 1000),
  category_id uuid not null references categories(id),
  is_pinned boolean not null default false,
  is_answered boolean not null default false,
  vote_count int not null default 0,
  created_at timestamptz not null default now()
);

create table replies(
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  nama text not null check (char_length(nama) between 2 and 50),
  isi text not null check (char_length(isi) between 2 and 1000),
  is_admin boolean not null default false,
  is_official boolean not null default false,
  created_at timestamptz not null default now()
);

create table votes(
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  voter_hash text not null,
  created_at timestamptz not null default now(),
  unique(question_id, voter_hash)
);

-- Flag admin: user_id = auth.users.id yang didaftarkan panitia manual.
create table admins(user_id uuid primary key);

insert into categories(name, slug) values
  ('Umum','umum'),
  ('Inovasi','inovasi'),
  ('Entrepreneur','entrepreneur'),
  ('Data Mining','data-mining'),
  ('Competitive Programming','competitive-programming'),
  ('Cybersecurity','cybersecurity');

alter table categories enable row level security;
alter table questions enable row level security;
alter table replies enable row level security;
alter table votes enable row level security;

create policy "public read categories" on categories for select using (true);
create policy "public read questions" on questions for select using (true);
create policy "public insert questions" on questions for insert with check (true);
create policy "admin update questions" on questions for update
  using (exists (select 1 from admins where admins.user_id = auth.uid()));
create policy "admin delete questions" on questions for delete
  using (exists (select 1 from admins where admins.user_id = auth.uid()));
create policy "public read replies" on replies for select using (true);
create policy "public insert replies" on replies for insert with check (true);
create policy "admin all replies" on replies for all
  using (exists (select 1 from admins where admins.user_id = auth.uid()));
create policy "public read votes" on votes for select using (true);
create policy "public insert votes" on votes for insert with check (true);

-- Setiap vote baru menaikkan counter agar board tidak perlu COUNT(*) tiap render.
-- SECURITY DEFINER wajib: trigger jalan saat INSERT anonim, dan anon dilarang
-- UPDATE questions oleh RLS sehingga tanpa ini setiap vote akan gagal.
create or replace function bump_vote() returns trigger
security definer set search_path = public as $$
begin
  update questions set vote_count = vote_count + 1 where id = new.question_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_bump_vote on votes;
create trigger trg_bump_vote after insert on votes
  for each row execute function bump_vote();

create index idx_q_category on questions(category_id);
create index idx_q_pinned on questions(is_pinned);
create index idx_q_created on questions(created_at desc);
create index idx_r_question on replies(question_id, created_at);
