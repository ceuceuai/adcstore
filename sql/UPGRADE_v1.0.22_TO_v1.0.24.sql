-- ADCStore v1.0.22 -> v1.0.24
-- v1.0.23 belum perlu dideploy.
-- Menambah pilihan sumber CTA homepage per produk.

alter table public.products
  add column if not exists homepage_salespage_source text not null default 'auto',
  add column if not exists homepage_checkout_source text not null default 'auto';

alter table public.products
  drop constraint if exists products_homepage_salespage_source_check,
  add constraint products_homepage_salespage_source_check
    check (homepage_salespage_source in ('auto','affiliate','internal','hidden'));

alter table public.products
  drop constraint if exists products_homepage_checkout_source_check,
  add constraint products_homepage_checkout_source_check
    check (homepage_checkout_source in ('auto','affiliate','internal','hidden'));

update public.products
set homepage_salespage_source = coalesce(nullif(homepage_salespage_source,''),'auto'),
    homepage_checkout_source = coalesce(nullif(homepage_checkout_source,''),'auto');

select 'ADCStore v1.0.24 upgrade complete' as status;
