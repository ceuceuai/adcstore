-- ADCStore v1.0.22 - MASTER FRESH INSTALLER
-- Jalankan seluruh file ini sekali di Supabase SQL Editor.
-- Setelah installer selesai, buat akun pertama di Authentication > Users.
-- Akun Authentication PERTAMA otomatis menjadi OWNER. Tidak perlu query UUID manual.

create extension if not exists pgcrypto;


create table if not exists public.media_library (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text,
  public_url text not null unique,
  mime_type text,
  size_bytes bigint,
  sha256 text unique,
  source text not null default 'upload',
  uploaded_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

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

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  image_url text,
  gallery_images jsonb not null default '[]'::jsonb,
  video_url text,
  price numeric(14,2) not null default 0,
  compare_at_price numeric(14,2) not null default 0,
  show_discount_badge boolean not null default true,
  discount_badge_text text,
  category text,
  affiliate_salespage_url text,
  internal_salespage_html text,
  affiliate_url text,
  cta_text text not null default 'Beli di Official Website',
  internal_cta_text text not null default 'Checkout di Website',
  affiliate_salespage_cta_text text not null default 'Lihat Salespage Official',
  sale_mode text not null default 'affiliate' check (sale_mode in ('affiliate','internal','both')),
  featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  brand_name text not null default 'ADCStore',
  tagline text not null default 'Digital Store & Affiliate Website for ADC Members',
  logo_url text,
  favicon_url text,
  whatsapp text,
  instagram_url text,
  primary_color text not null default '#8b5cf6',
  secondary_color text not null default '#c4b5fd',
  accent_color text not null default '#f9a8d4',
  theme_preset text not null default 'lavender',
  hero_badge text not null default 'BONUS EKSKLUSIF • ADCStore',
  hero_title text not null default 'Produk Digital Siap Jual untuk Member ADC',
  hero_subtitle text not null default 'Temukan produk digital pilihan dan beli melalui link affiliate resmi.',
  hero_primary_cta_text text not null default 'Lihat Produk',
  hero_member_cta_text text not null default 'Masuk Member',
  hero_member_cta_enabled boolean not null default true,
  hero_trust_1 text not null default 'Produk siap promosi',
  hero_trust_2 text not null default 'Link affiliate sendiri',
  hero_trust_3 text not null default 'Tema bisa diganti',
  hero_visual_mode text not null default 'default' check (hero_visual_mode in ('default','upload','url','none')),
  hero_image_url text,
  hero_image_position text not null default 'right' check (hero_image_position in ('left','right')),
  hero_image_fit text not null default 'contain' check (hero_image_fit in ('contain','cover')),
  hero_image_alt text not null default 'ADCStore Hero',
  catalog_eyebrow text not null default 'KATALOG DIGITAL',
  catalog_title text not null default 'Produk pilihan untuk mulai jualan',
  catalog_subtitle text not null default 'Produk ADC sudah tersedia. Pemilik toko tinggal mengatur link affiliate masing-masing.',
  floating_wa_enabled boolean not null default false,
  floating_wa_number text,
  floating_wa_message text not null default 'Halo, saya butuh bantuan tentang produk di ADCStore.',
  floating_wa_position text not null default 'right' check (floating_wa_position in ('left','right')),
  floating_wa_style text not null default '3d' check (floating_wa_style in ('3d','round','custom')),
  floating_wa_icon_url text,
  floating_wa_tooltip text not null default 'Butuh bantuan? Chat WhatsApp',
  floating_wa_show_on text not null default 'all' check (floating_wa_show_on in ('all','home','product')),
  footer_text text not null default 'ADCStore — Digital Store & Affiliate Website for ADC Members',
  home_products_per_page integer not null default 8 check (home_products_per_page in (6,8,10,12,16,20)),
  pwa_name text not null default 'ADCStore',
  pwa_short_name text not null default 'ADCStore',
  pwa_icon_url text,
  member_login_label text not null default 'Member',
  member_login_heading text not null default 'Welcome Back!',
  member_login_description text not null default 'Masuk untuk membuka member area dan mengatur tema pribadi Anda.',
  member_signup_heading text not null default 'Buat Akun Member',
  member_signup_description text not null default 'Daftar untuk mengakses member area.',
  owner_login_label text not null default 'Owner',
  owner_login_heading text not null default 'Owner Login',
  owner_login_description text not null default 'Halaman privat pemilik toko.',
  admin_console_label text not null default 'Owner Console',
  updated_at timestamptz not null default now()
);



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

create table if not exists public.homepage_banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  desktop_image_url text not null,
  mobile_image_url text,
  target_url text,
  cta_text text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('member','owner')),
  theme_preset text not null default 'lavender',
  custom_primary text,
  custom_secondary text,
  custom_accent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);


create table if not exists public.payment_settings (
  id integer primary key default 1 check (id = 1),
  banks jsonb not null default '[]'::jsonb,
  ewallets jsonb not null default '[]'::jsonb,
  qris_enabled boolean not null default false,
  qris_label text not null default 'QRIS',
  qris_image_url text,
  instructions text not null default 'Silakan lakukan pembayaran sesuai nominal pesanan, lalu simpan bukti pembayaran.',
  updated_at timestamptz not null default now()
);

create table if not exists public.product_access (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products(id) on delete cascade,
  access_type text not null default 'both' check (access_type in ('html','buttons','both')),
  html_content text,
  buttons jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  product_id uuid not null references public.products(id) on delete restrict,
  customer_name text not null,
  customer_email text not null,
  customer_whatsapp text not null,
  amount numeric(14,2) not null default 0,
  payment_method text not null,
  status text not null default 'pending' check (status in ('pending','paid','completed','cancelled')),
  payment_proof_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.payment_settings(id) values (1) on conflict (id) do nothing;

-- Bucket publik hanya untuk aset toko seperti QRIS. Upload/delete tetap khusus owner.
insert into storage.buckets (id,name,public)
values ('store-assets','store-assets',true)
on conflict (id) do update set public=true;

insert into public.store_settings (id) values (1) on conflict (id) do nothing;

insert into public.social_links(platform,label,url,is_active,sort_order)
select 'Instagram','Instagram',instagram_url,true,0 from public.store_settings
where id=1 and nullif(trim(coalesce(instagram_url,'')),'') is not null
  and not exists(select 1 from public.social_links where lower(platform)='instagram' and url=public.store_settings.instagram_url);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists product_categories_updated_at on public.product_categories;
create trigger product_categories_updated_at before update on public.product_categories for each row execute function public.set_updated_at();

drop trigger if exists settings_updated_at on public.store_settings;
create trigger settings_updated_at before update on public.store_settings for each row execute function public.set_updated_at();
drop trigger if exists social_links_updated_at on public.social_links;
create trigger social_links_updated_at before update on public.social_links for each row execute function public.set_updated_at();
drop trigger if exists homepage_banners_updated_at on public.homepage_banners;
create trigger homepage_banners_updated_at before update on public.homepage_banners for each row execute function public.set_updated_at();
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists payment_settings_updated_at on public.payment_settings;
create trigger payment_settings_updated_at before update on public.payment_settings for each row execute function public.set_updated_at();
drop trigger if exists product_access_updated_at on public.product_access;
create trigger product_access_updated_at before update on public.product_access for each row execute function public.set_updated_at();
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  make_owner boolean := false;
begin
  -- Kunci singkat agar hanya user Authentication pertama yang menjadi owner.
  lock table public.admin_users in exclusive mode;
  make_owner := not exists(select 1 from public.admin_users);

  insert into public.profiles(id,full_name,role)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),case when make_owner then 'owner' else 'member' end)
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = case when make_owner then 'owner' else public.profiles.role end;

  if make_owner then
    insert into public.admin_users(user_id) values(new.id) on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Backfill profile untuk user Auth yang sudah ada.
insert into public.profiles(id,full_name,role)
select id,coalesce(raw_user_meta_data->>'full_name',''),'member' from auth.users
on conflict (id) do nothing;

-- Jika installer dijalankan setelah akun Auth sudah dibuat, akun Auth tertua otomatis dijadikan OWNER.
insert into public.admin_users(user_id)
select u.id
from auth.users u
where not exists(select 1 from public.admin_users)
order by u.created_at asc
limit 1
on conflict do nothing;

update public.profiles p
set role='owner'
where exists(select 1 from public.admin_users a where a.user_id=p.id);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.media_library enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.store_settings enable row level security;
alter table public.social_links enable row level security;
alter table public.homepage_banners enable row level security;
alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.payment_settings enable row level security;
alter table public.product_access enable row level security;
alter table public.orders enable row level security;


-- Explicit API privileges. RLS policies below remain the real authorization layer.
-- Supabase/PostgREST still needs table-level GRANT in addition to RLS policies.
grant usage on schema public to anon, authenticated;

-- Public storefront reads.
grant select on public.products to anon, authenticated;
grant select on public.product_categories to anon, authenticated;
grant select on public.store_settings to anon, authenticated;
grant select on public.social_links to anon, authenticated;
grant select on public.homepage_banners to anon, authenticated;
grant select on public.payment_settings to anon, authenticated;

-- Public checkout may create an order.
grant insert on public.orders to anon, authenticated;

-- Authenticated users need table privileges first; RLS below decides which rows/actions are allowed.
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.product_categories to authenticated;
grant select, insert, update, delete on public.store_settings to authenticated;
grant select, insert, update, delete on public.social_links to authenticated;
grant select, insert, update, delete on public.homepage_banners to authenticated;
grant select, insert, update, delete on public.payment_settings to authenticated;
grant select, insert, update, delete on public.product_access to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.media_library to authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "Admin manage media library" on public.media_library;
create policy "Admin manage media library" on public.media_library for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read active categories" on public.product_categories;
create policy "Public read active categories" on public.product_categories for select to anon, authenticated using (is_active = true or public.is_admin());
drop policy if exists "Admin manage categories" on public.product_categories;
create policy "Admin manage categories" on public.product_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products" on public.products for select to anon, authenticated using (is_active = true or public.is_admin());
drop policy if exists "Admin manage products" on public.products;
create policy "Admin manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());



drop policy if exists "Public read active social links" on public.social_links;
create policy "Public read active social links" on public.social_links for select to anon, authenticated using (is_active = true or public.is_admin());
drop policy if exists "Admin manage social links" on public.social_links;
create policy "Admin manage social links" on public.social_links for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read active banners" on public.homepage_banners;
create policy "Public read active banners" on public.homepage_banners for select to anon, authenticated using (is_active = true or public.is_admin());
drop policy if exists "Admin manage banners" on public.homepage_banners;
create policy "Admin manage banners" on public.homepage_banners for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read settings" on public.store_settings;
create policy "Public read settings" on public.store_settings for select to anon, authenticated using (true);
drop policy if exists "Admin manage settings" on public.store_settings;
create policy "Admin manage settings" on public.store_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Profile read own" on public.profiles;
create policy "Profile read own" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "Profile update own" on public.profiles;
create policy "Profile update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "Admin read admin row" on public.admin_users;
create policy "Admin read admin row" on public.admin_users for select to authenticated using (user_id = auth.uid());


-- Payment settings: data rekening memang perlu dibaca publik saat checkout, hanya owner yang boleh mengubah.
drop policy if exists "Public read payment settings" on public.payment_settings;
create policy "Public read payment settings" on public.payment_settings for select to anon, authenticated using (true);
drop policy if exists "Admin manage payment settings" on public.payment_settings;
create policy "Admin manage payment settings" on public.payment_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Order: customer boleh membuat order. Hanya owner yang bisa mengubah status.
drop policy if exists "Anyone create order" on public.orders;
create policy "Anyone create order" on public.orders for insert to anon, authenticated with check (true);
drop policy if exists "Member read own orders" on public.orders;
create policy "Member read own orders" on public.orders for select to authenticated using (public.is_admin() or lower(customer_email)=lower(coalesce(auth.jwt()->>'email','')));
drop policy if exists "Admin manage orders" on public.orders;
create policy "Admin manage orders" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Akses produk hanya tampil ke owner atau member yang punya order paid/completed dengan email akun yang sama.
drop policy if exists "Member read purchased access" on public.product_access;
create policy "Member read purchased access" on public.product_access for select to authenticated using (
  public.is_admin() or (
    is_active = true and exists(
      select 1 from public.orders o
      where o.product_id = product_access.product_id
        and o.status in ('paid','completed')
        and lower(o.customer_email)=lower(coalesce(auth.jwt()->>'email',''))
    )
  )
);
drop policy if exists "Admin manage product access" on public.product_access;
create policy "Admin manage product access" on public.product_access for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage QRIS / aset toko.
drop policy if exists "Public read store assets" on storage.objects;
create policy "Public read store assets" on storage.objects for select to public using (bucket_id='store-assets');
drop policy if exists "Admin upload store assets" on storage.objects;
create policy "Admin upload store assets" on storage.objects for insert to authenticated with check (bucket_id='store-assets' and public.is_admin());
drop policy if exists "Admin update store assets" on storage.objects;
create policy "Admin update store assets" on storage.objects for update to authenticated using (bucket_id='store-assets' and public.is_admin()) with check (bucket_id='store-assets' and public.is_admin());
drop policy if exists "Admin delete store assets" on storage.objects;
create policy "Admin delete store assets" on storage.objects for delete to authenticated using (bucket_id='store-assets' and public.is_admin());


create or replace function public.media_usage_count(p_url text) returns integer
language plpgsql stable security definer set search_path = public as $$
declare n integer := 0;
begin
  if not public.is_admin() then return 0; end if;
  select n +
    (select count(*) from public.store_settings where logo_url=p_url or favicon_url=p_url or hero_image_url=p_url or floating_wa_icon_url=p_url or pwa_icon_url=p_url) +
    (select count(*) from public.product_categories where image_url=p_url) +
    (select count(*) from public.products where image_url=p_url or gallery_images @> jsonb_build_array(p_url)) +
    (select count(*) from public.homepage_banners where desktop_image_url=p_url or mobile_image_url=p_url) +
    (select count(*) from public.social_links where icon_url=p_url) +
    (select count(*) from public.payment_settings where qris_image_url=p_url)
  into n;
  return n;
end $$;
grant execute on function public.media_usage_count(text) to authenticated;

insert into public.product_categories(name,slug,is_active,sort_order)
values
('Produk Digital','produk-digital',true,1),
('Template','template',true,2),
('Ebook','ebook',true,3),
('Bonus','bonus',true,4)
on conflict (slug) do nothing;

insert into public.products (name,slug,short_description,description,price,category,cta_text,featured,is_active,sort_order)
values
('Produk ADC 01','produk-adc-01','Template produk pertama. Ganti dengan katalog ADC resmi.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Produk Digital','Beli via Link Resmi',true,true,1),
('Produk ADC 02','produk-adc-02','Template produk kedua. Tinggal tempel link affiliate Anda.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Produk Digital','Beli via Link Resmi',true,true,2),
('Produk ADC 03','produk-adc-03','Template produk ketiga untuk katalog ADCStore.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Produk Digital','Beli Sekarang',false,true,3),
('Produk ADC 04','produk-adc-04','Template katalog siap diedit.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Template','Lihat Penawaran',false,true,4),
('Produk ADC 05','produk-adc-05','Aktifkan/nonaktifkan sesuai kebutuhan toko.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Ebook','Beli Sekarang',false,true,5),
('Produk ADC 06','produk-adc-06','Produk contoh untuk setup awal.','Isi deskripsi produk ADC resmi dari dashboard admin.',49000,'Bonus','Ambil Produk',false,true,6)
on conflict (slug) do nothing;


-- Daftarkan aset lama ke Media Library agar langsung bisa dipilih ulang setelah upgrade/fresh install.
insert into public.media_library(file_name,public_url,source)
select 'legacy-'||substr(md5(u),1,10),u,'legacy'
from (
  select logo_url u from public.store_settings where logo_url is not null
  union select favicon_url from public.store_settings where favicon_url is not null
  union select hero_image_url from public.store_settings where hero_image_url is not null
  union select floating_wa_icon_url from public.store_settings where floating_wa_icon_url is not null
  union select pwa_icon_url from public.store_settings where pwa_icon_url is not null
  union select image_url from public.product_categories where image_url is not null
  union select image_url from public.products where image_url is not null
  union select jsonb_array_elements_text(gallery_images) from public.products where jsonb_typeof(gallery_images)='array'
  union select desktop_image_url from public.homepage_banners where desktop_image_url is not null
  union select mobile_image_url from public.homepage_banners where mobile_image_url is not null
  union select icon_url from public.social_links where icon_url is not null
  union select qris_image_url from public.payment_settings where qris_image_url is not null
) q where nullif(trim(u),'') is not null
on conflict (public_url) do nothing;

