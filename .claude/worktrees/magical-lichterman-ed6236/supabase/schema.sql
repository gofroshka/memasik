-- ============================
-- МЕМАСИК — Supabase Schema
-- ============================

-- 1. Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Words table
create table if not exists public.words (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  translation text not null,
  description text not null default '',
  image_url text,
  category text,
  transcription text,
  transcription_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Storage bucket for word images
insert into storage.buckets (id, name, public)
values ('word-images', 'word-images', true)
on conflict do nothing;

-- ============================
-- RLS Policies
-- ============================

alter table public.profiles enable row level security;
alter table public.words enable row level security;

-- Profiles: users see their own profile, admins see all
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Words: anyone can read
create policy "Anyone can read words"
  on public.words for select
  using (true);

-- Words: only admins can insert/update/delete
create policy "Admins can insert words"
  on public.words for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can update words"
  on public.words for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can delete words"
  on public.words for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Storage: anyone can read images, only admins can upload
create policy "Public can read word images"
  on storage.objects for select
  using (bucket_id = 'word-images');

create policy "Admins can upload word images"
  on storage.objects for insert
  with check (
    bucket_id = 'word-images' and
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can delete word images"
  on storage.objects for delete
  using (
    bucket_id = 'word-images' and
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================
-- Make yourself admin (run manually after signup):
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'your-user-uuid';
-- ============================
