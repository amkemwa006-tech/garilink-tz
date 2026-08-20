-- Run this once in Supabase: SQL Editor -> New query -> Run.
-- It lets authenticated sellers create their own drafts and upload their own photos.

alter table public.listings enable row level security;
alter table public.listing_images enable row level security;

drop policy if exists "GariLink sellers create their own listings" on public.listings;
create policy "GariLink sellers create their own listings"
  on public.listings for insert
  to authenticated
  with check (
    seller_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('seller', 'dealer')
    )
  );

drop policy if exists "GariLink sellers view their own listings" on public.listings;
create policy "GariLink sellers view their own listings"
  on public.listings for select
  to authenticated
  using (seller_id = auth.uid());

drop policy if exists "GariLink sellers add their listing photos" on public.listing_images;
create policy "GariLink sellers add their listing photos"
  on public.listing_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.seller_id = auth.uid()
    )
  );

drop policy if exists "GariLink sellers view their listing photos" on public.listing_images;
create policy "GariLink sellers view their listing photos"
  on public.listing_images for select
  to authenticated
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.seller_id = auth.uid()
    )
  );

drop policy if exists "GariLink sellers upload their own storage photos" on storage.objects;
create policy "GariLink sellers upload their own storage photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-images.'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "GariLink sellers delete their own storage photos" on storage.objects;
create policy "GariLink sellers delete their own storage photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-images.'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
