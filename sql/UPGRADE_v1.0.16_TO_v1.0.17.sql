-- ADCStore v1.0.17 upgrade from v1.0.16
-- Social Media dinamis + perbaikan preview icon PWA.

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text not null,
  url text not null,
  icon_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists social_links_updated_at on public.social_links;
create trigger social_links_updated_at before update on public.social_links for each row execute function public.set_updated_at();

alter table public.social_links enable row level security;
grant usage on schema public to anon, authenticated;
grant select on public.social_links to anon, authenticated;
grant insert, update, delete on public.social_links to authenticated;

drop policy if exists "Public read active social links" on public.social_links;
create policy "Public read active social links" on public.social_links for select to anon, authenticated using (is_active = true or public.is_admin());
drop policy if exists "Admin manage social links" on public.social_links;
create policy "Admin manage social links" on public.social_links for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Migrasi Instagram lama satu kali bila sebelumnya diisi di store_settings.
insert into public.social_links(platform,label,url,is_active,sort_order)
select 'Instagram','Instagram',instagram_url,true,0 from public.store_settings
where id=1 and nullif(trim(coalesce(instagram_url,'')),'') is not null
  and not exists(select 1 from public.social_links where lower(platform)='instagram' and url=public.store_settings.instagram_url);
