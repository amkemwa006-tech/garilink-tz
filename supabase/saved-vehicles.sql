-- Run this once in Supabase: SQL Editor -> New query -> Run.
-- It stores each buyer's saved listings and prevents duplicate saves.

create table if not exists public.saved_vehicles (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.saved_vehicles enable row level security;

drop policy if exists "Buyers can read their saved vehicles" on public.saved_vehicles;
create policy "Buyers can read their saved vehicles"
  on public.saved_vehicles for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Buyers can save vehicles" on public.saved_vehicles;
create policy "Buyers can save vehicles"
  on public.saved_vehicles for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Buyers can remove saved vehicles" on public.saved_vehicles;
create policy "Buyers can remove saved vehicles"
  on public.saved_vehicles for delete
  to authenticated
  using (auth.uid() = user_id);
