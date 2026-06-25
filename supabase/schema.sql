-- BigRank v1 (brandaura-ai / ai-visibility-tracker) schema
-- Reconstructed from src/lib/supabase.js + BrandSetup/TrackingSettings/ProfilePage + edge functions.
-- Run in Supabase SQL Editor on project tqmmgyrevovqhuipqvli.
-- Safe to re-run. auth.users (auth schema) is NOT touched; this only (re)creates the 5 app tables.

-- Drop any conflicting leftovers (e.g. the v2 schema that was loaded). CASCADE clears dependents.
drop table if exists public.test_results cascade;
drop table if exists public.schedules   cascade;
drop table if exists public.alerts       cascade;
drop table if exists public.brands       cascade;
drop table if exists public.profiles     cascade;

-- ===== profiles (1:1 with auth.users) =====
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text,
  avatar_url       text,
  job_title        text,
  company_name     text,
  company_website  text,
  use_case         text,
  plan             text    default 'free',
  api_calls_used   integer default 0,
  api_calls_limit  integer default 100,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ===== brands (many per user); settings jsonb holds alerts/digest config =====
create table public.brands (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  name                text not null,
  domain              text,
  website             text,
  category            text,
  industry            text,
  use_case            text,
  competitors         jsonb default '[]'::jsonb,
  selected_platforms  jsonb default '[]'::jsonb,
  settings            jsonb default '{}'::jsonb,
  review_site         text,
  topic_name          text,
  last_tracking_run   timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
create index brands_user_id_idx on public.brands(user_id);

-- ===== test_results (many per brand) =====
create table public.test_results (
  id                  uuid primary key default gen_random_uuid(),
  brand_id            uuid not null references public.brands(id) on delete cascade,
  platform_id         text,
  platform_name       text,
  query_type          text,
  query_length        integer,
  prompt_persona      text,
  prompt_intent       text,
  funnel_stage        text,
  response_text       text,
  full_response       text,
  response_time       integer,
  word_count          integer,
  brand_mention       boolean default false,
  brand_mentioned     boolean,
  brand_position      integer,
  mention_count       integer,
  mention_type        text,
  competitor_mentions jsonb default '[]'::jsonb,
  cited_urls          jsonb default '[]'::jsonb,
  confidence_score    numeric,
  batch_id            uuid,
  topic_id            uuid,
  topic_name          text,
  created_at          timestamptz default now()
);
create index test_results_brand_idx on public.test_results(brand_id, created_at desc);

-- ===== schedules (1 per brand) =====
create table public.schedules (
  brand_id    uuid primary key references public.brands(id) on delete cascade,
  enabled     boolean default false,
  frequency   text,
  next_run    timestamptz,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ===== alerts (1 per brand) =====
create table public.alerts (
  brand_id    uuid primary key references public.brands(id) on delete cascade,
  enabled     boolean default false,
  email       text,
  threshold   integer default 10,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ===== Row Level Security =====
alter table public.profiles     enable row level security;
alter table public.brands       enable row level security;
alter table public.test_results enable row level security;
alter table public.schedules    enable row level security;
alter table public.alerts       enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "brands_all_own" on public.brands for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "test_results_by_owner" on public.test_results for all
  using (exists (select 1 from public.brands b where b.id = test_results.brand_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.brands b where b.id = test_results.brand_id and b.user_id = auth.uid()));

create policy "schedules_by_owner" on public.schedules for all
  using (exists (select 1 from public.brands b where b.id = schedules.brand_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.brands b where b.id = schedules.brand_id and b.user_id = auth.uid()));

create policy "alerts_by_owner" on public.alerts for all
  using (exists (select 1 from public.brands b where b.id = alerts.brand_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.brands b where b.id = alerts.brand_id and b.user_id = auth.uid()));

-- ===== Auto-create a profile row on signup (the missing piece behind the 404) =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
          new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill a profile for users that already exist (incl. the one you just made)
insert into public.profiles (id)
select id from auth.users on conflict (id) do nothing;

-- ===== avatars storage bucket (ProfilePage uploads avatars here) =====
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read"  on storage.objects;
drop policy if exists "avatars_auth_insert"  on storage.objects;
drop policy if exists "avatars_auth_update"  on storage.objects;
create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_auth_insert" on storage.objects for insert to authenticated with check (bucket_id = 'avatars');
create policy "avatars_auth_update" on storage.objects for update to authenticated using (bucket_id = 'avatars');
