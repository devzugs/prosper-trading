-- 1. Enhance Profiles Table
alter table public.profiles
  add column if not exists phone text,
  add column if not exists avatar_url text,
  -- C6 FIX: bio column was referenced in user-profile edge function but never created
  add column if not exists bio text,
  -- C4 FIX: is_deactivated was written by deactivate-account edge function but never created
  add column if not exists is_deactivated boolean not null default false;

-- 2. Create User Preferences Table
create table if not exists public.user_preferences (
  id uuid primary key references auth.users(id) on delete cascade,
  currency text default 'USD - US Dollar',
  language text default 'English',
  timezone text default 'GMT (London)',
  date_format text default 'DD/MM/YYYY',
  login_alerts boolean default true,
  updated_at timestamptz default now()
);

-- Use your existing trigger function to auto-update timestamps
drop trigger if exists trg_user_preferences_updated_at on public.user_preferences;

create trigger trg_user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

-- 3. Create User Sessions Table (For Security UI Tracking)
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  browser text,
  os text,
  device_type text,
  ip_address text,
  location text,
  last_active_at timestamptz default now(),
  revoked_at timestamptz,
  is_current boolean default false
);

create index if not exists idx_user_sessions_user on public.user_sessions (user_id);

-- 4. Configure Avatars Storage Bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 5. Storage RLS Policies (Security)
drop policy if exists "Avatars are publicly accessible." on storage.objects;
create policy "Avatars are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatars." on storage.objects;
create policy "Users can upload their own avatars."
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

drop policy if exists "Users can update their own avatars." on storage.objects;
create policy "Users can update their own avatars."
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );