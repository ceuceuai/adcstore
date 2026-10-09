-- ADCStore v1.0.17 -> v1.0.18
-- Master Kategori Produk + filter/sorting homepage.
create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists product_categories_updated_at on public.product_categories;
create trigger product_categories_updated_at before update on public.product_categories
for each row execute function public.set_updated_at();

alter table public.product_categories enable row level security;
grant select on public.product_categories to anon, authenticated;
grant insert, update, delete on public.product_categories to authenticated;

drop policy if exists "Public read active categories" on public.product_categories;
create policy "Public read active categories" on public.product_categories
for select to anon, authenticated using (is_active = true or public.is_admin());

drop policy if exists "Admin manage categories" on public.product_categories;
create policy "Admin manage categories" on public.product_categories
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Migrasikan semua kategori lama yang sudah pernah dipakai produk.
insert into public.product_categories(name,slug,is_active,sort_order)
select distinct trim(category),
       regexp_replace(regexp_replace(lower(trim(category)),'[^a-z0-9]+','-','g'),'(^-|-$)','','g'),
       true, 0
from public.products
where category is not null and trim(category) <> ''
on conflict do nothing;
