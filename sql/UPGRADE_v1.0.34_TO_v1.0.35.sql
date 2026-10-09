-- ADCStore v1.0.34 -> v1.0.35
-- Dynamic Promo / Exclusive homepage section.

alter table public.products
  add column if not exists highlight_type text not null default 'none',
  add column if not exists highlight_label text,
  add column if not exists highlight_sort_order integer not null default 0;

alter table public.products
  drop constraint if exists products_highlight_type_check,
  add constraint products_highlight_type_check
    check (highlight_type in ('none','promo','exclusive','custom'));

alter table public.store_settings
  add column if not exists highlight_section_enabled boolean not null default true,
  add column if not exists highlight_section_eyebrow text not null default 'PILIHAN SPESIAL',
  add column if not exists highlight_section_title text not null default 'Promo & Produk Eksklusif',
  add column if not exists highlight_section_subtitle text not null default 'Produk pilihan yang sedang diprioritaskan untuk Anda.';

select 'ADCStore v1.0.35 upgrade complete' as status;
