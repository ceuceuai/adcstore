-- ADCStore v1.0.18 -> v1.0.19
-- Media Library terpusat + dedupe SHA-256.
create table if not exists public.media_library (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text,
  public_url text not null unique,
  mime_type text,
  size_bytes bigint,
  sha256 text unique,
  source text not null default 'upload',
  uploaded_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
alter table public.media_library enable row level security;
grant select, insert, update, delete on public.media_library to authenticated;
drop policy if exists "Admin manage media library" on public.media_library;
create policy "Admin manage media library" on public.media_library for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.media_usage_count(p_url text) returns integer
language plpgsql stable security definer set search_path = public as $$
declare n integer := 0;
begin
  if not public.is_admin() then return 0; end if;
  select n +
    (select count(*) from public.store_settings where logo_url=p_url or favicon_url=p_url or hero_image_url=p_url or floating_wa_icon_url=p_url or pwa_icon_url=p_url) +
    (select count(*) from public.product_categories where image_url=p_url) +
    (select count(*) from public.products where image_url=p_url or gallery_images @> jsonb_build_array(p_url)) +
    (select count(*) from public.homepage_banners where desktop_image_url=p_url or mobile_image_url=p_url) +
    (select count(*) from public.social_links where icon_url=p_url) +
    (select count(*) from public.payment_settings where qris_image_url=p_url)
  into n;
  return n;
end $$;
grant execute on function public.media_usage_count(text) to authenticated;

insert into public.media_library(file_name,public_url,source)
select 'legacy-'||substr(md5(u),1,10),u,'legacy'
from (
  select logo_url u from public.store_settings where logo_url is not null
  union select favicon_url from public.store_settings where favicon_url is not null
  union select hero_image_url from public.store_settings where hero_image_url is not null
  union select floating_wa_icon_url from public.store_settings where floating_wa_icon_url is not null
  union select pwa_icon_url from public.store_settings where pwa_icon_url is not null
  union select image_url from public.product_categories where image_url is not null
  union select image_url from public.products where image_url is not null
  union select jsonb_array_elements_text(gallery_images) from public.products where jsonb_typeof(gallery_images)='array'
  union select desktop_image_url from public.homepage_banners where desktop_image_url is not null
  union select mobile_image_url from public.homepage_banners where mobile_image_url is not null
  union select icon_url from public.social_links where icon_url is not null
  union select qris_image_url from public.payment_settings where qris_image_url is not null
) q where nullif(trim(u),'') is not null
on conflict (public_url) do nothing;


-- Permission audit/fix for v1.0.20
-- Fix explicit PostgREST table privileges.
-- RLS remains enabled and continues to enforce row-level authorization.

grant usage on schema public to anon, authenticated;

grant select on public.products to anon, authenticated;
grant select on public.product_categories to anon, authenticated;
grant select on public.store_settings to anon, authenticated;
grant select on public.social_links to anon, authenticated;
grant select on public.homepage_banners to anon, authenticated;
grant select on public.payment_settings to anon, authenticated;

grant insert on public.orders to anon, authenticated;

grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.product_categories to authenticated;
grant select, insert, update, delete on public.store_settings to authenticated;
grant select, insert, update, delete on public.social_links to authenticated;
grant select, insert, update, delete on public.homepage_banners to authenticated;
grant select, insert, update, delete on public.payment_settings to authenticated;
grant select, insert, update, delete on public.product_access to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.media_library to authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.admin_users to authenticated;
