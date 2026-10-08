-- ADCStore v1.0.10 -> v1.0.11
-- Promo pricing, homepage slider banner, mobile bottom nav, dan PWA.

alter table public.products add column if not exists compare_at_price numeric(14,2) not null default 0;
alter table public.products add column if not exists show_discount_badge boolean not null default true;
alter table public.products add column if not exists discount_badge_text text;

alter table public.store_settings add column if not exists pwa_name text not null default 'ADCStore';
alter table public.store_settings add column if not exists pwa_short_name text not null default 'ADCStore';
alter table public.store_settings add column if not exists pwa_icon_url text;

create table if not exists public.homepage_banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  desktop_image_url text not null,
  mobile_image_url text,
  target_url text,
  cta_text text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.homepage_banners enable row level security;

drop trigger if exists homepage_banners_updated_at on public.homepage_banners;
create trigger homepage_banners_updated_at before update on public.homepage_banners for each row execute function public.set_updated_at();

drop policy if exists "Public read active banners" on public.homepage_banners;
create policy "Public read active banners" on public.homepage_banners for select to anon, authenticated using (is_active = true or public.is_admin());
drop policy if exists "Admin manage banners" on public.homepage_banners;
create policy "Admin manage banners" on public.homepage_banners for all to authenticated using (public.is_admin()) with check (public.is_admin());
