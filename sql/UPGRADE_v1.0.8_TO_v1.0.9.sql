-- ADCStore v1.0.8 -> v1.0.9
-- Multi-image gallery, video sales letter URL, dan setting pagination homepage.

alter table public.products
  add column if not exists gallery_images jsonb not null default '[]'::jsonb,
  add column if not exists video_url text;

alter table public.store_settings
  add column if not exists home_products_per_page integer not null default 8;

update public.products set gallery_images='[]'::jsonb where gallery_images is null;
update public.store_settings set home_products_per_page=8 where home_products_per_page is null;

-- Opsional constraint aman jika belum ada.
do $$
begin
  if not exists (select 1 from pg_constraint where conname='store_settings_home_products_per_page_check') then
    alter table public.store_settings add constraint store_settings_home_products_per_page_check
      check (home_products_per_page in (6,8,10,12,16,20));
  end if;
end $$;
