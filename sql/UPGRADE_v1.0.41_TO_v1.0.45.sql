-- ADCStore v1.0.41 -> v1.0.45 ONE-SHOT SCHEMA REPAIR + UPGRADE
-- Safe to run even if some columns already exist.
-- This repairs historical store_settings schema drift, then applies multi-product checkout and post-checkout redirect.
-- After running, PostgREST schema cache is explicitly reloaded.

-- 1) Repair ALL store_settings columns expected by current frontend.
alter table public.store_settings
  add column if not exists favicon_url text,
  add column if not exists instagram_url text,
  add column if not exists primary_color text not null default '#8b5cf6',
  add column if not exists secondary_color text not null default '#c4b5fd',
  add column if not exists accent_color text not null default '#f9a8d4',
  add column if not exists theme_preset text not null default 'lavender',

  add column if not exists hero_badge text not null default 'BONUS EKSKLUSIF • ADCStore',
  add column if not exists hero_title text not null default 'Produk Digital Siap Jual untuk Member ADC',
  add column if not exists hero_subtitle text not null default 'Temukan produk digital pilihan dan beli melalui link affiliate resmi.',
  add column if not exists hero_primary_cta_text text not null default 'Lihat Produk',
  add column if not exists hero_member_cta_text text not null default 'Masuk Member',
  add column if not exists hero_member_cta_enabled boolean not null default true,
  add column if not exists hero_trust_1 text not null default 'Produk siap promosi',
  add column if not exists hero_trust_2 text not null default 'Link affiliate sendiri',
  add column if not exists hero_trust_3 text not null default 'Tema bisa diganti',
  add column if not exists hero_visual_mode text not null default 'default',
  add column if not exists hero_image_url text,
  add column if not exists hero_image_position text not null default 'right',
  add column if not exists hero_image_fit text not null default 'contain',
  add column if not exists hero_image_alt text not null default 'ADCStore Hero',

  add column if not exists catalog_eyebrow text not null default 'KATALOG DIGITAL',
  add column if not exists catalog_title text not null default 'Produk pilihan untuk mulai jualan',
  add column if not exists catalog_subtitle text not null default 'Produk ADC sudah tersedia. Pemilik toko tinggal mengatur link affiliate masing-masing.',

  add column if not exists highlight_section_enabled boolean not null default true,
  add column if not exists highlight_section_eyebrow text not null default 'PILIHAN SPESIAL',
  add column if not exists highlight_section_title text not null default 'Promo & Produk Eksklusif',
  add column if not exists highlight_section_subtitle text not null default 'Produk pilihan yang sedang diprioritaskan untuk Anda.',

  add column if not exists floating_wa_enabled boolean not null default false,
  add column if not exists floating_wa_number text,
  add column if not exists floating_wa_target_type text not null default 'number',
  add column if not exists floating_wa_target_url text,
  add column if not exists floating_wa_mobile_mode text not null default 'above_nav',
  add column if not exists floating_wa_message text not null default 'Halo, saya butuh bantuan tentang produk di ADCStore.',
  add column if not exists floating_wa_position text not null default 'right',
  add column if not exists floating_wa_style text not null default '3d',
  add column if not exists floating_wa_icon_url text,
  add column if not exists floating_wa_tooltip text not null default 'Butuh bantuan? Chat WhatsApp',
  add column if not exists floating_wa_show_on text not null default 'all',

  add column if not exists checkout_success_action text not null default 'whatsapp',
  add column if not exists checkout_success_url text,

  add column if not exists footer_text text not null default 'ADCStore — Digital Store & Affiliate Website for ADC Members',
  add column if not exists home_products_per_page integer not null default 8,
  add column if not exists pwa_name text not null default 'ADCStore',
  add column if not exists pwa_short_name text not null default 'ADCStore',
  add column if not exists pwa_icon_url text,

  add column if not exists meta_pixel_enabled boolean not null default false,
  add column if not exists meta_pixel_id text,
  add column if not exists tiktok_pixel_enabled boolean not null default false,
  add column if not exists tiktok_pixel_id text,
  add column if not exists ga4_enabled boolean not null default false,
  add column if not exists ga4_measurement_id text,
  add column if not exists gtm_enabled boolean not null default false,
  add column if not exists gtm_container_id text,

  add column if not exists member_login_label text not null default 'Member',
  add column if not exists member_login_heading text not null default 'Welcome Back!',
  add column if not exists member_login_description text not null default 'Masuk untuk membuka member area dan mengatur tema pribadi Anda.',
  add column if not exists member_signup_heading text not null default 'Buat Akun Member',
  add column if not exists member_signup_description text not null default 'Daftar untuk mengakses member area.',
  add column if not exists member_login_visual_mode text not null default 'brand',
  add column if not exists member_login_visual_url text,

  add column if not exists owner_login_label text not null default 'Owner',
  add column if not exists owner_login_heading text not null default 'Owner Login',
  add column if not exists owner_login_description text not null default 'Halaman privat pemilik toko.',
  add column if not exists owner_login_visual_mode text not null default 'brand',
  add column if not exists owner_login_visual_url text,

  add column if not exists admin_console_label text not null default 'Owner Console',
  add column if not exists admin_dashboard_badge text not null default 'OWNER DASHBOARD',
  add column if not exists admin_dashboard_title text not null default 'Kelola toko digital tanpa ribet.',
  add column if not exists admin_dashboard_description text not null default 'Produk, checkout, pembayaran, dan akses member ada dalam satu tempat.',
  add column if not exists admin_dashboard_visual_mode text not null default 'brand',
  add column if not exists admin_dashboard_visual_url text;

-- 2) Normalize constraints expected by current frontend.
alter table public.store_settings
  drop constraint if exists store_settings_hero_visual_mode_check,
  add constraint store_settings_hero_visual_mode_check check (hero_visual_mode in ('default','upload','url','none')),
  drop constraint if exists store_settings_hero_image_position_check,
  add constraint store_settings_hero_image_position_check check (hero_image_position in ('left','right')),
  drop constraint if exists store_settings_hero_image_fit_check,
  add constraint store_settings_hero_image_fit_check check (hero_image_fit in ('contain','cover')),
  drop constraint if exists store_settings_floating_wa_target_type_check,
  add constraint store_settings_floating_wa_target_type_check check (floating_wa_target_type in ('number','url')),
  drop constraint if exists store_settings_floating_wa_mobile_mode_check,
  add constraint store_settings_floating_wa_mobile_mode_check check (floating_wa_mobile_mode in ('above_nav','nav_item')),
  drop constraint if exists store_settings_floating_wa_position_check,
  add constraint store_settings_floating_wa_position_check check (floating_wa_position in ('left','right')),
  drop constraint if exists store_settings_floating_wa_style_check,
  add constraint store_settings_floating_wa_style_check check (floating_wa_style in ('3d','round','custom')),
  drop constraint if exists store_settings_floating_wa_show_on_check,
  add constraint store_settings_floating_wa_show_on_check check (floating_wa_show_on in ('all','home','product')),
  drop constraint if exists store_settings_checkout_success_action_check,
  add constraint store_settings_checkout_success_action_check check (checkout_success_action in ('whatsapp','url','none')),
  drop constraint if exists store_settings_member_login_visual_mode_check,
  add constraint store_settings_member_login_visual_mode_check check (member_login_visual_mode in ('brand','custom','none')),
  drop constraint if exists store_settings_owner_login_visual_mode_check,
  add constraint store_settings_owner_login_visual_mode_check check (owner_login_visual_mode in ('brand','custom','none')),
  drop constraint if exists store_settings_admin_dashboard_visual_mode_check,
  add constraint store_settings_admin_dashboard_visual_mode_check check (admin_dashboard_visual_mode in ('brand','custom','none'));

-- 3) Multi-product checkout table.
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  price numeric(14,2) not null default 0,
  quantity integer not null default 1 check (quantity > 0),
  subtotal numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);

alter table public.order_items enable row level security;

grant insert on public.order_items to anon, authenticated;
grant select, insert, update, delete on public.order_items to authenticated;

drop policy if exists "Anyone create order items" on public.order_items;
create policy "Anyone create order items" on public.order_items
for insert to anon, authenticated with check (true);

drop policy if exists "Owner/member read order items" on public.order_items;
create policy "Owner/member read order items" on public.order_items
for select to authenticated using (
  public.is_admin() or exists(
    select 1 from public.orders o
    where o.id=order_items.order_id
      and lower(o.customer_email)=lower(coalesce(auth.jwt()->>'email',''))
  )
);

drop policy if exists "Admin manage order items" on public.order_items;
create policy "Admin manage order items" on public.order_items
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 4) Member access supports items inside multi-product orders.
drop policy if exists "Member read purchased access" on public.product_access;
create policy "Member read purchased access" on public.product_access
for select to authenticated using (
  public.is_admin() or (
    is_active = true and (
      exists(
        select 1 from public.orders o
        where o.product_id = product_access.product_id
          and o.status in ('paid','completed')
          and lower(o.customer_email)=lower(coalesce(auth.jwt()->>'email',''))
      )
      or exists(
        select 1
        from public.order_items oi
        join public.orders o on o.id=oi.order_id
        where oi.product_id=product_access.product_id
          and o.status in ('paid','completed')
          and lower(o.customer_email)=lower(coalesce(auth.jwt()->>'email',''))
      )
    )
  )
);

-- 5) Make sure the settings row exists.
insert into public.store_settings(id) values (1) on conflict (id) do nothing;

-- 6) Force Supabase/PostgREST to refresh table metadata immediately.
notify pgrst, 'reload schema';

select 'ADCStore v1.0.45 schema repair + upgrade complete' as status;
