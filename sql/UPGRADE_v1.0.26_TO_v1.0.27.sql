-- ADCStore v1.0.26 -> v1.0.27
alter table public.store_settings
  add column if not exists floating_wa_target_type text not null default 'number',
  add column if not exists floating_wa_target_url text,
  add column if not exists floating_wa_mobile_mode text not null default 'above_nav';
alter table public.store_settings
  drop constraint if exists store_settings_floating_wa_target_type_check,
  add constraint store_settings_floating_wa_target_type_check check (floating_wa_target_type in ('number','url')),
  drop constraint if exists store_settings_floating_wa_mobile_mode_check,
  add constraint store_settings_floating_wa_mobile_mode_check check (floating_wa_mobile_mode in ('above_nav','nav_item'));
select 'ADCStore v1.0.27 upgrade complete' as status;
