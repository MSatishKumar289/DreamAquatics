create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_favorites_user_product_unique unique (user_id, product_id)
);

create index if not exists user_favorites_user_id_idx
  on public.user_favorites (user_id);

create index if not exists user_favorites_user_created_at_idx
  on public.user_favorites (user_id, created_at desc);

alter table public.user_favorites enable row level security;

drop policy if exists "Users can view their own favorites" on public.user_favorites;
create policy "Users can view their own favorites"
  on public.user_favorites
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can add their own favorites" on public.user_favorites;
create policy "Users can add their own favorites"
  on public.user_favorites
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own favorites" on public.user_favorites;
create policy "Users can remove their own favorites"
  on public.user_favorites
  for delete
  using (auth.uid() = user_id);
