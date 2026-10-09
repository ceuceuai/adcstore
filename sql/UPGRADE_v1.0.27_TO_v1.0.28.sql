-- ADCStore v1.0.27 -> v1.0.28 FINAL
-- Internal Analytics + optional Meta Pixel, TikTok Pixel, GA4, GTM.

alter table public.store_settings
  add column if not exists meta_pixel_enabled boolean not null default false,
  add column if not exists meta_pixel_id text,
  add column if not exists tiktok_pixel_enabled boolean not null default false,
  add column if not exists tiktok_pixel_id text,
  add column if not exists ga4_enabled boolean not null default false,
  add column if not exists ga4_measurement_id text,
  add column if not exists gtm_enabled boolean not null default false,
  add column if not exists gtm_container_id text;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_view','product_view','salespage_click','checkout_click','whatsapp_click','banner_click','purchase')),
  product_id uuid references public.products(id) on delete set null,
  page_path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;
grant insert on public.analytics_events to anon, authenticated;
grant select, delete on public.analytics_events to authenticated;

drop policy if exists "Public insert analytics" on public.analytics_events;
create policy "Public insert analytics" on public.analytics_events for insert to anon, authenticated with check (true);

drop policy if exists "Admin read analytics" on public.analytics_events;
create policy "Admin read analytics" on public.analytics_events for select to authenticated using (public.is_admin());

drop policy if exists "Admin delete analytics" on public.analytics_events;
create policy "Admin delete analytics" on public.analytics_events for delete to authenticated using (public.is_admin());

select 'ADCStore v1.0.28 upgrade complete' as status;
