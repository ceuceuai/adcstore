-- ADCStore v1.0.3 - MASTER FRESH INSTALLER
-- Jalankan seluruh file ini sekali di Supabase SQL Editor.
-- Setelah membuat akun OWNER di Authentication > Users, salin User UID lalu jalankan:
-- insert into public.admin_users(user_id) values ('PASTE-USER-UUID-DI-SINI');

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  image_url text,
  price numeric(14,2) not null default 0,
  category text,
  affiliate_url text,
  cta_text text not null default 'Beli Sekarang',
  sale_mode text not null default 'affiliate' check (sale_mode in ('affiliate','internal','both')),
  featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  brand_name text not null default 'ADCStore',
  tagline text not null default 'Digital Store & Affiliate Website for ADC Members',
  logo_url text,
  whatsapp text,
  instagram_url text,
  primary_color text not null default '#8b5cf6',
  secondary_color text not null default '#c4b5fd',
  accent_color text not null default '#f9a8d4',
  theme_preset text not null default 'lavender',
  hero_title text not null default 'Produk Digital Siap Jual untuk Member ADC',
  hero_subtitle text not null default 'Temukan produk digital pilihan dan beli melalui link affiliate resmi.',
  footer_text text not null default 'ADCStore — Digital Store & Affiliate Website for ADC Members',
  updated_at timestamptz not null default now()
);

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

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

insert into public.store_settings (id) values (1) on conflict (id) do nothing;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists settings_updated_at on public.store_settings;
create trigger settings_updated_at before update on public.store_settings for each row execute function public.set_updated_at();
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,full_name,role)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),'member')
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Backfill profile untuk user Auth yang sudah ada.
insert into public.profiles(id,full_name,role)
select id,coalesce(raw_user_meta_data->>'full_name',''),'member' from auth.users
on conflict (id) do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.products enable row level security;
alter table public.store_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products" on public.products for select to anon, authenticated using (is_active = true or public.is_admin());
drop policy if exists "Admin manage products" on public.products;
create policy "Admin manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read settings" on public.store_settings;
create policy "Public read settings" on public.store_settings for select to anon, authenticated using (true);
drop policy if exists "Admin manage settings" on public.store_settings;
create policy "Admin manage settings" on public.store_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Profile read own" on public.profiles;
create policy "Profile read own" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "Profile update own" on public.profiles;
create policy "Profile update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "Admin read admin row" on public.admin_users;
create policy "Admin read admin row" on public.admin_users for select to authenticated using (user_id = auth.uid());

insert into public.products (name,slug,short_description,description,price,category,cta_text,featured,is_active,sort_order)
values
('Produk ADC 01','produk-adc-01','Template produk pertama. Ganti dengan katalog ADC resmi.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Produk Digital','Beli via Link Resmi',true,true,1),
('Produk ADC 02','produk-adc-02','Template produk kedua. Tinggal tempel link affiliate Anda.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Produk Digital','Beli via Link Resmi',true,true,2),
('Produk ADC 03','produk-adc-03','Template produk ketiga untuk katalog ADCStore.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Produk Digital','Beli Sekarang',false,true,3),
('Produk ADC 04','produk-adc-04','Template katalog siap diedit.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Template','Lihat Penawaran',false,true,4),
('Produk ADC 05','produk-adc-05','Aktifkan/nonaktifkan sesuai kebutuhan toko.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Ebook','Beli Sekarang',false,true,5),
('Produk ADC 06','produk-adc-06','Produk contoh untuk setup awal.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Bonus','Ambil Produk',false,true,6)
on conflict (slug) do nothing;
