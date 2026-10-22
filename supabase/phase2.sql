-- PHASE 2 migration. Run AFTER schema.sql (Supabase -> SQL Editor -> New query -> paste -> Run)

alter table agents   add column if not exists is_admin boolean default false;
alter table listings add column if not exists photos text[] default '{}';

-- helper: is the current user an admin?
create or replace function current_is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from agents where id = auth.uid()), false)
$$;

-- agents can create their own profile (never as admin)
drop policy if exists "agent inserts own profile" on agents;
create policy "agent inserts own profile" on agents for insert
  with check (auth.uid() = id and is_admin = false and verified = false);

-- listings: new listings must start as pending + unverified
drop policy if exists "agent inserts own listings" on listings;
create policy "agent inserts own listings" on listings for insert
  with check (auth.uid() = agent_id and verified = false and status = 'pending');

-- admin can see/update everything
drop policy if exists "admin reads listings" on listings;
create policy "admin reads listings" on listings for select using (current_is_admin());
drop policy if exists "admin updates listings" on listings;
create policy "admin updates listings" on listings for update using (current_is_admin());
drop policy if exists "admin reads reports" on reports;
create policy "admin reads reports" on reports for select using (current_is_admin());
drop policy if exists "admin reads agents" on agents;
create policy "admin reads agents" on agents for select using (current_is_admin());

-- Agents cannot self-verify or self-publish: only admin (or SQL editor) can change verified/status freely.
-- Agents may only change status to 'sold'.
create or replace function protect_listing_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not current_is_admin() then
    new.verified := old.verified;
    new.agent_id := old.agent_id;
    if new.status is distinct from old.status and new.status <> 'sold' then
      new.status := old.status;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_protect_listing on listings;
create trigger trg_protect_listing before update on listings
  for each row execute function protect_listing_fields();

-- 3 customer reports -> listing auto-hidden
create or replace function auto_hide_reported() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from reports where listing_id = new.listing_id) >= 3 then
    update listings set status = 'hidden' where id = new.listing_id;
  end if;
  return new;
end $$;
drop trigger if exists trg_auto_hide on reports;
create trigger trg_auto_hide after insert on reports
  for each row execute function auto_hide_reported();

-- photo storage bucket (public read, agents upload only into their own folder)
insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true)
  on conflict (id) do nothing;
drop policy if exists "public read photos" on storage.objects;
create policy "public read photos" on storage.objects for select using (bucket_id = 'listing-photos');
drop policy if exists "agents upload own photos" on storage.objects;
create policy "agents upload own photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- AFTER you sign up and log in once, make yourself admin (put YOUR email):
-- update agents set is_admin = true where id = (select id from auth.users where email = 'you@example.com');
