-- ADCStore v1.0.33 -> v1.0.34
-- Dynamic login visual for Member and Owner. No hardcoded login illustration.
alter table public.store_settings
  add column if not exists member_login_visual_mode text not null default 'brand',
  add column if not exists member_login_visual_url text,
  add column if not exists owner_login_visual_mode text not null default 'brand',
  add column if not exists owner_login_visual_url text;
alter table public.store_settings
  drop constraint if exists store_settings_member_login_visual_mode_check,
  add constraint store_settings_member_login_visual_mode_check check (member_login_visual_mode in ('brand','custom','none')),
  drop constraint if exists store_settings_owner_login_visual_mode_check,
  add constraint store_settings_owner_login_visual_mode_check check (owner_login_visual_mode in ('brand','custom','none'));
select 'ADCStore v1.0.34 upgrade complete' as status;
