-- Run this in Supabase: SQL Editor -> New query -> paste -> Run

create table if not exists agents (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  office_address text,
  verified boolean default false,
  score int default 100,
  created_at timestamptz default now()
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  agent_name text not null,
  phone text not null,               -- e.g. 923001234567
  precinct text not null,            -- 10A, 27 ...
  type text not null,                -- Plot, Ghar, Flat, File
  title text not null,
  description text,
  price bigint not null,             -- PKR
  verified boolean default false,    -- only you (admin) set this
  status text default 'pending',     -- pending | active | sold | hidden
  confirmed_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  listing_id uuid references listings(id) on delete set null,
  name text, phone text, budget text, note text,
  status text default 'new',         -- new | contacted | visit | deal
  created_at timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  reason text,                       -- not_available | rate_different
  created_at timestamptz default now()
);

-- Row Level Security
alter table agents enable row level security;
alter table listings enable row level security;
alter table leads enable row level security;
alter table reports enable row level security;

-- Public can read only active listings
create policy "public read active listings" on listings for select using (status = 'active');
-- Agents manage their own listings (cannot set verified: do that from the admin side)
create policy "agent reads own listings" on listings for select using (auth.uid() = agent_id);
create policy "agent inserts own listings" on listings for insert with check (auth.uid() = agent_id and verified = false);
create policy "agent updates own listings" on listings for update using (auth.uid() = agent_id);
-- Agents see only their own profile and leads
create policy "agent own profile" on agents for select using (auth.uid() = id);
create policy "agent own leads" on leads for select using (auth.uid() = agent_id);
create policy "agent updates own leads" on leads for update using (auth.uid() = agent_id);
-- Anyone can send a report
create policy "anyone reports" on reports for insert with check (true);
