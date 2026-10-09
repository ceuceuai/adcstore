-- ADCStore v1.0.19 -> v1.0.20
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
