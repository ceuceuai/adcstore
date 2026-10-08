-- ADCStore v1.0.2 -> v1.0.3
-- Jalankan untuk project yang SUDAH memakai v1.0.2.
alter table public.store_settings add column if not exists secondary_color text not null default '#c4b5fd';
alter table public.store_settings add column if not exists accent_color text not null default '#f9a8d4';
alter table public.store_settings add column if not exists theme_preset text not null default 'lavender';
update public.store_settings set primary_color=coalesce(primary_color,'#8b5cf6'),secondary_color=coalesce(secondary_color,'#c4b5fd'),accent_color=coalesce(accent_color,'#f9a8d4'),theme_preset=coalesce(theme_preset,'lavender') where id=1;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('member','owner')),
  theme_preset text not null default 'lavender',
  custom_primary text,
  custom_secondary text,
  custom_accent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade,created_at timestamptz not null default now());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,full_name,role) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),'member') on conflict(id) do nothing; return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
insert into public.profiles(id,full_name,role) select id,coalesce(raw_user_meta_data->>'full_name',''),'member' from auth.users on conflict(id) do nothing;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from public.admin_users where user_id=auth.uid());$$;
grant execute on function public.is_admin() to anon,authenticated;

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
drop policy if exists "Authenticated manage products" on public.products;
drop policy if exists "Admin manage products" on public.products;
create policy "Admin manage products" on public.products for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists "Public read active products" on public.products;
create policy "Public read active products" on public.products for select to anon,authenticated using(is_active=true or public.is_admin());
drop policy if exists "Authenticated manage settings" on public.store_settings;
drop policy if exists "Admin manage settings" on public.store_settings;
create policy "Admin manage settings" on public.store_settings for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists "Public read settings" on public.store_settings;
create policy "Public read settings" on public.store_settings for select to anon,authenticated using(true);
drop policy if exists "Profile read own" on public.profiles;
create policy "Profile read own" on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
drop policy if exists "Profile update own" on public.profiles;
create policy "Profile update own" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
drop policy if exists "Admin read admin row" on public.admin_users;
create policy "Admin read admin row" on public.admin_users for select to authenticated using(user_id=auth.uid());

-- PENTING setelah upgrade: masukkan UID akun owner dari Authentication > Users:
-- insert into public.admin_users(user_id) values ('PASTE-OWNER-USER-UUID') on conflict do nothing;
