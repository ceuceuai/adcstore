-- ADCStore v1.0.15 -> v1.0.16
-- Fix permission save Pengaturan + transparent brand logo rendering.

-- Pastikan role API punya privilege dasar. RLS tetap menjadi lapisan otorisasi owner.
grant usage on schema public to anon, authenticated;
grant select on public.store_settings to anon, authenticated;
grant insert, update on public.store_settings to authenticated;

-- Recreate policy agar owner yang terdaftar di admin_users dapat menyimpan settings.
drop policy if exists "Public read settings" on public.store_settings;
create policy "Public read settings" on public.store_settings for select to anon, authenticated using (true);
drop policy if exists "Admin manage settings" on public.store_settings;
create policy "Admin manage settings" on public.store_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

select 'ADCStore v1.0.16 settings permission fix ready' as status;
