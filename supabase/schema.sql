-- Winable Phase 1 MVP Schema
-- Run this in your Supabase SQL Editor

-- Enable required extensions
create extension if not exists "pgcrypto";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  primary_handle text,
  primary_platform text check (primary_platform in ('instagram', 'tiktok', 'youtube')),
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Giveaways table
create table public.giveaways (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  prize_name text not null,
  prize_description text,
  prize_value numeric(10,2),
  winner_count integer default 1 not null,
  end_date timestamptz not null,
  status text default 'draft' not null check (status in ('draft', 'live', 'ended')),
  slug text unique not null,
  host_message text,
  prize_image_url text,
  referral_bonus_count integer default 3 not null,
  created_at timestamptz default now() not null
);

alter table public.giveaways enable row level security;

-- Creators can manage their own giveaways
create policy "Creators can view own giveaways" on public.giveaways
  for select using (auth.uid() = creator_id);

create policy "Creators can insert giveaways" on public.giveaways
  for insert with check (auth.uid() = creator_id);

create policy "Creators can update own giveaways" on public.giveaways
  for update using (auth.uid() = creator_id);

-- Anyone can view live giveaways (for public page)
create policy "Anyone can view live giveaways" on public.giveaways
  for select using (status = 'live' or status = 'ended');

-- Entries table
create table public.entries (
  id uuid default gen_random_uuid() primary key,
  giveaway_id uuid references public.giveaways(id) on delete cascade not null,
  email text not null,
  first_name text,
  referral_code text unique not null,
  referred_by_entry_id uuid references public.entries(id),
  bonus_entries integer default 0 not null,
  created_at timestamptz default now() not null,
  unique(giveaway_id, email)
);

alter table public.entries enable row level security;

-- Anyone can insert entries (public entry form)
create policy "Anyone can enter giveaways" on public.entries
  for insert with check (true);

-- Entrants can view their own entry by email (for referral confirmation)
create policy "Anyone can view entries" on public.entries
  for select using (true);

-- Creators can view entries for their giveaways
create policy "Creators can view giveaway entries" on public.entries
  for select using (
    exists (
      select 1 from public.giveaways
      where giveaways.id = entries.giveaway_id
      and giveaways.creator_id = auth.uid()
    )
  );

-- Allow updating bonus_entries for referral tracking
create policy "Allow updating bonus entries" on public.entries
  for update using (true)
  with check (true);

-- Winners table
create table public.winners (
  id uuid default gen_random_uuid() primary key,
  giveaway_id uuid references public.giveaways(id) on delete cascade not null,
  entry_id uuid references public.entries(id) on delete cascade not null,
  selected_at timestamptz default now() not null,
  unique(giveaway_id, entry_id)
);

alter table public.winners enable row level security;

create policy "Creators can manage winners" on public.winners
  for all using (
    exists (
      select 1 from public.giveaways
      where giveaways.id = winners.giveaway_id
      and giveaways.creator_id = auth.uid()
    )
  );

create policy "Anyone can view winners" on public.winners
  for select using (true);

-- Create indexes for performance
create index idx_giveaways_creator on public.giveaways(creator_id);
create index idx_giveaways_slug on public.giveaways(slug);
create index idx_giveaways_status on public.giveaways(status);
create index idx_entries_giveaway on public.entries(giveaway_id);
create index idx_entries_referral_code on public.entries(referral_code);
create index idx_entries_referred_by on public.entries(referred_by_entry_id);
create index idx_winners_giveaway on public.winners(giveaway_id);

-- RPC function to increment bonus entries atomically
create or replace function public.increment_bonus_entries(entry_id uuid, bonus integer)
returns void as $$
begin
  update public.entries
  set bonus_entries = bonus_entries + bonus
  where id = entry_id;
end;
$$ language plpgsql security definer;

-- Storage bucket for prize images
insert into storage.buckets (id, name, public) values ('prize-images', 'prize-images', true)
on conflict do nothing;

create policy "Anyone can view prize images" on storage.objects
  for select using (bucket_id = 'prize-images');

create policy "Authenticated users can upload prize images" on storage.objects
  for insert with check (bucket_id = 'prize-images' and auth.role() = 'authenticated');

create policy "Users can update own prize images" on storage.objects
  for update using (bucket_id = 'prize-images' and auth.role() = 'authenticated');
