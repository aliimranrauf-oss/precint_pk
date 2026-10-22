-- PHASE 3 migration. Run AFTER phase2.sql (Supabase -> SQL Editor -> New query -> paste -> Run)

alter table leads add column if not exists source text default 'chatbot';
alter table leads add column if not exists transcript text;

-- admin can see and assign every lead
drop policy if exists "admin reads leads" on leads;
create policy "admin reads leads" on leads for select using (current_is_admin());
drop policy if exists "admin updates leads" on leads;
create policy "admin updates leads" on leads for update using (current_is_admin());

-- chat usage counter (cost control). No policies = nobody can read it directly.
create table if not exists chat_usage (
  ip_hash text not null,
  day date not null,
  count int not null default 0,
  primary key (ip_hash, day)
);
alter table chat_usage enable row level security;

create or replace function bump_chat_usage(p_ip text, p_limit int) returns boolean
language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into chat_usage (ip_hash, day, count) values (p_ip, current_date, 1)
  on conflict (ip_hash, day) do update set count = chat_usage.count + 1
  returning count into c;
  return c <= p_limit;
end $$;

-- the ONLY way the public chatbot can create a lead
create or replace function submit_lead(
  p_listing uuid, p_name text, p_phone text, p_budget text, p_note text, p_transcript text
) returns boolean
language plpgsql security definer set search_path = public as $$
declare a uuid;
begin
  if length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) < 10 then return false; end if;
  if p_listing is not null then select agent_id into a from listings where id = p_listing; end if;
  if exists (select 1 from leads where phone = p_phone and listing_id is not distinct from p_listing
             and created_at > now() - interval '1 day') then return false; end if;
  insert into leads (agent_id, listing_id, name, phone, budget, note, transcript, source)
  values (a, p_listing, left(p_name, 80), left(p_phone, 20), left(p_budget, 80), left(p_note, 500), left(p_transcript, 2000), 'chatbot');
  return true;
end $$;
