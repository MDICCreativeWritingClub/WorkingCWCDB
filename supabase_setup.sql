-- ============================================================
-- CWC Supabase Schema
-- Run this entire file in: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. Site Config (single row, holds all admin settings)
create table if not exists site_config (
  key text primary key,
  value jsonb not null
);

-- 2. Writers (created automatically on first submission)
create table if not exists writers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade text not null,
  student_code text,
  created_at timestamptz default now()
);

-- 3. Submissions
create table if not exists submissions (
  id text primary key,
  writer_id uuid references writers(id),
  name text not null,
  student_code text,
  grade text not null,
  category text not null,
  theme text not null,
  title text not null,
  content text not null,
  submitted_at timestamptz default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected'))
);

-- 4. Votes (one row per article, stores total count)
create table if not exists votes (
  article_id text primary key,
  count integer not null default 0
);

-- 5. Voter log (prevents double voting per session)
create table if not exists voter_log (
  session_id text not null,
  article_id text not null,
  voted_at timestamptz default now(),
  primary key (session_id, article_id)
);

-- 6. Monthly snapshots (archive leaderboard records)
create table if not exists monthly_snapshots (
  id text primary key,
  month_label text not null,
  captured_at timestamptz default now(),
  top_writers jsonb not null default '[]',
  top_writings jsonb not null default '[]'
);

-- ============================================================
-- Enable Row Level Security (RLS) — allow public read/write
-- for now. You can tighten these later.
-- ============================================================

alter table site_config enable row level security;
alter table writers enable row level security;
alter table submissions enable row level security;
alter table votes enable row level security;
alter table voter_log enable row level security;
alter table monthly_snapshots enable row level security;

-- Public read + write policies (open for now)
create policy "public read site_config" on site_config for select using (true);
create policy "public write site_config" on site_config for all using (true);

create policy "public read writers" on writers for select using (true);
create policy "public write writers" on writers for all using (true);

create policy "public read submissions" on submissions for select using (true);
create policy "public write submissions" on submissions for all using (true);

create policy "public read votes" on votes for select using (true);
create policy "public write votes" on votes for all using (true);

create policy "public read voter_log" on voter_log for select using (true);
create policy "public write voter_log" on voter_log for all using (true);

create policy "public read monthly_snapshots" on monthly_snapshots for select using (true);
create policy "public write monthly_snapshots" on monthly_snapshots for all using (true);

-- ============================================================
-- Enable Realtime on tables that need live updates
-- ============================================================
alter publication supabase_realtime add table site_config;
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table submissions;
