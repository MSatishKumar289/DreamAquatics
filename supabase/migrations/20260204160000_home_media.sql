create table if not exists public.home_media (
  id bigint primary key check (id = 1),
  video_url text,
  video_path text,
  image_one_url text,
  image_one_path text,
  image_two_url text,
  image_two_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.home_media enable row level security;

create policy "Home media read" on public.home_media
  for select
  using (true);

create policy "Home media admin insert" on public.home_media
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Home media admin update" on public.home_media
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Home media admin delete" on public.home_media
  for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

insert into storage.buckets (id, name, public)
values ('home-media', 'home-media', true)
on conflict (id) do update set public = true;

create policy "Home media public read" on storage.objects
  for select
  using (bucket_id = 'home-media');

create policy "Home media admin insert" on storage.objects
  for insert
  with check (
    bucket_id = 'home-media'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Home media admin update" on storage.objects
  for update
  using (
    bucket_id = 'home-media'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Home media admin delete" on storage.objects
  for delete
  using (
    bucket_id = 'home-media'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
