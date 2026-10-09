-- ADCStore v1.0.37 -> v1.0.38
-- Dynamic Owner Dashboard hero text + visual.

alter table public.store_settings
  add column if not exists admin_dashboard_badge text not null default 'OWNER DASHBOARD',
  add column if not exists admin_dashboard_title text not null default 'Kelola toko digital tanpa ribet.',
  add column if not exists admin_dashboard_description text not null default 'Produk, checkout, pembayaran, dan akses member ada dalam satu tempat.',
  add column if not exists admin_dashboard_visual_mode text not null default 'brand',
  add column if not exists admin_dashboard_visual_url text;

alter table public.store_settings
  drop constraint if exists store_settings_admin_dashboard_visual_mode_check,
  add constraint store_settings_admin_dashboard_visual_mode_check
    check (admin_dashboard_visual_mode in ('brand','custom','none'));

select 'ADCStore v1.0.38 upgrade complete' as status;
