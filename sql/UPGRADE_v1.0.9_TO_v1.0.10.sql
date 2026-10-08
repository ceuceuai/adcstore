-- ADCStore v1.0.9 -> v1.0.10
-- Homepage configurable + hero image upload/URL + Floating WhatsApp.
-- Jalankan sekali di Supabase SQL Editor sebelum deploy source v1.0.10.

alter table public.store_settings add column if not exists hero_badge text not null default 'BONUS EKSKLUSIF • ADCStore';
alter table public.store_settings add column if not exists hero_primary_cta_text text not null default 'Lihat Produk';
alter table public.store_settings add column if not exists hero_member_cta_text text not null default 'Masuk Member';
alter table public.store_settings add column if not exists hero_member_cta_enabled boolean not null default true;
alter table public.store_settings add column if not exists hero_trust_1 text not null default 'Produk siap promosi';
alter table public.store_settings add column if not exists hero_trust_2 text not null default 'Link affiliate sendiri';
alter table public.store_settings add column if not exists hero_trust_3 text not null default 'Tema bisa diganti';
alter table public.store_settings add column if not exists hero_visual_mode text not null default 'default';
alter table public.store_settings add column if not exists hero_image_url text;
alter table public.store_settings add column if not exists hero_image_position text not null default 'right';
alter table public.store_settings add column if not exists hero_image_fit text not null default 'contain';
alter table public.store_settings add column if not exists hero_image_alt text not null default 'ADCStore Hero';
alter table public.store_settings add column if not exists catalog_eyebrow text not null default 'KATALOG DIGITAL';
alter table public.store_settings add column if not exists catalog_title text not null default 'Produk pilihan untuk mulai jualan';
alter table public.store_settings add column if not exists catalog_subtitle text not null default 'Produk ADC sudah tersedia. Pemilik toko tinggal mengatur link affiliate masing-masing.';
alter table public.store_settings add column if not exists floating_wa_enabled boolean not null default false;
alter table public.store_settings add column if not exists floating_wa_number text;
alter table public.store_settings add column if not exists floating_wa_message text not null default 'Halo, saya butuh bantuan tentang produk di ADCStore.';
alter table public.store_settings add column if not exists floating_wa_position text not null default 'right';
alter table public.store_settings add column if not exists floating_wa_style text not null default '3d';
alter table public.store_settings add column if not exists floating_wa_icon_url text;
alter table public.store_settings add column if not exists floating_wa_tooltip text not null default 'Butuh bantuan? Chat WhatsApp';
alter table public.store_settings add column if not exists floating_wa_show_on text not null default 'all';

-- Validasi nilai tanpa mengganggu data yang sudah ada.
do $$ begin
  if not exists (select 1 from pg_constraint where conname='store_settings_hero_visual_mode_check') then
    alter table public.store_settings add constraint store_settings_hero_visual_mode_check check (hero_visual_mode in ('default','upload','url','none'));
  end if;
  if not exists (select 1 from pg_constraint where conname='store_settings_hero_image_position_check') then
    alter table public.store_settings add constraint store_settings_hero_image_position_check check (hero_image_position in ('left','right'));
  end if;
  if not exists (select 1 from pg_constraint where conname='store_settings_hero_image_fit_check') then
    alter table public.store_settings add constraint store_settings_hero_image_fit_check check (hero_image_fit in ('contain','cover'));
  end if;
  if not exists (select 1 from pg_constraint where conname='store_settings_floating_wa_position_check') then
    alter table public.store_settings add constraint store_settings_floating_wa_position_check check (floating_wa_position in ('left','right'));
  end if;
  if not exists (select 1 from pg_constraint where conname='store_settings_floating_wa_style_check') then
    alter table public.store_settings add constraint store_settings_floating_wa_style_check check (floating_wa_style in ('3d','round','custom'));
  end if;
  if not exists (select 1 from pg_constraint where conname='store_settings_floating_wa_show_on_check') then
    alter table public.store_settings add constraint store_settings_floating_wa_show_on_check check (floating_wa_show_on in ('all','home','product'));
  end if;
end $$;
