-- ADCStore v1.0.13 -> v1.0.14
-- Dynamic branding/login/favicon update

alter table public.store_settings add column if not exists favicon_url text;
alter table public.store_settings add column if not exists member_login_label text not null default 'Member';
alter table public.store_settings add column if not exists member_login_heading text not null default 'Welcome Back!';
alter table public.store_settings add column if not exists member_login_description text not null default 'Masuk untuk membuka member area dan mengatur tema pribadi Anda.';
alter table public.store_settings add column if not exists member_signup_heading text not null default 'Buat Akun Member';
alter table public.store_settings add column if not exists member_signup_description text not null default 'Daftar untuk mengakses member area.';
alter table public.store_settings add column if not exists owner_login_label text not null default 'Owner';
alter table public.store_settings add column if not exists owner_login_heading text not null default 'Owner Login';
alter table public.store_settings add column if not exists owner_login_description text not null default 'Halaman privat pemilik toko.';
alter table public.store_settings add column if not exists admin_console_label text not null default 'Owner Console';

select 'ADCStore v1.0.14 branding fields ready' as status;
