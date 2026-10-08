-- ADCStore v1.0.1 - MASTER INSTALLER
-- Jalankan seluruh file ini sekali di Supabase SQL Editor.

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
  primary_color text not null default '#6d5dfc',
  hero_title text not null default 'Produk Digital Siap Jual untuk Member ADC',
  hero_subtitle text not null default 'Temukan produk digital pilihan dan beli melalui link affiliate resmi.',
  footer_text text not null default 'ADCStore — Digital Store & Affiliate Website for ADC Members',
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (1) on conflict (id) do nothing;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists settings_updated_at on public.store_settings;
create trigger settings_updated_at before update on public.store_settings for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products" on public.products for select to anon using (is_active = true);
drop policy if exists "Authenticated manage products" on public.products;
create policy "Authenticated manage products" on public.products for all to authenticated using (true) with check (true);

drop policy if exists "Public read settings" on public.store_settings;
create policy "Public read settings" on public.store_settings for select to anon using (true);
drop policy if exists "Authenticated manage settings" on public.store_settings;
create policy "Authenticated manage settings" on public.store_settings for all to authenticated using (true) with check (true);

-- Sample katalog. Silakan ganti nama/deskripsi/gambar dengan katalog ADC resmi.
insert into public.products (name,slug,short_description,description,price,category,cta_text,featured,is_active,sort_order)
values
('Produk ADC 01','produk-adc-01','Template produk pertama. Ganti dengan katalog ADC resmi.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Produk Digital','Beli via Link Resmi',true,true,1),
('Produk ADC 02','produk-adc-02','Template produk kedua. Tinggal tempel link affiliate Anda.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Produk Digital','Beli via Link Resmi',true,true,2),
('Produk ADC 03','produk-adc-03','Template produk ketiga untuk katalog ADCStore.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Produk Digital','Beli Sekarang',false,true,3),
('Produk ADC 04','produk-adc-04','Template katalog siap diedit.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Template','Lihat Penawaran',false,true,4),
('Produk ADC 05','produk-adc-05','Aktifkan/nonaktifkan sesuai kebutuhan toko.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Ebook','Beli Sekarang',false,true,5),
('Produk ADC 06','produk-adc-06','Produk contoh untuk setup awal.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Bonus','Ambil Produk',false,true,6)
on conflict (slug) do nothing;
