-- ADCStore v1.0.4 -> v1.0.5
-- Jalankan SEKALI untuk project yang sudah memakai v1.0.4.
-- Tidak menghapus produk, settings, profiles, atau owner yang sudah ada.

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
insert into storage.buckets (id,name,public) values ('store-assets','store-assets',true) on conflict (id) do update set public=true;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
drop trigger if exists payment_settings_updated_at on public.payment_settings;
create trigger payment_settings_updated_at before update on public.payment_settings for each row execute function public.set_updated_at();
drop trigger if exists product_access_updated_at on public.product_access;
create trigger product_access_updated_at before update on public.product_access for each row execute function public.set_updated_at();
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

alter table public.payment_settings enable row level security;
alter table public.product_access enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Public read payment settings" on public.payment_settings;
create policy "Public read payment settings" on public.payment_settings for select to anon, authenticated using (true);
drop policy if exists "Admin manage payment settings" on public.payment_settings;
create policy "Admin manage payment settings" on public.payment_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone create order" on public.orders;
create policy "Anyone create order" on public.orders for insert to anon, authenticated with check (true);
drop policy if exists "Member read own orders" on public.orders;
create policy "Member read own orders" on public.orders for select to authenticated using (public.is_admin() or lower(customer_email)=lower(coalesce(auth.jwt()->>'email','')));
drop policy if exists "Admin manage orders" on public.orders;
create policy "Admin manage orders" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Member read purchased access" on public.product_access;
create policy "Member read purchased access" on public.product_access for select to authenticated using (
  public.is_admin() or (is_active=true and exists(select 1 from public.orders o where o.product_id=product_access.product_id and o.status in ('paid','completed') and lower(o.customer_email)=lower(coalesce(auth.jwt()->>'email',''))))
);
drop policy if exists "Admin manage product access" on public.product_access;
create policy "Admin manage product access" on public.product_access for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read store assets" on storage.objects;
create policy "Public read store assets" on storage.objects for select to public using (bucket_id='store-assets');
drop policy if exists "Admin upload store assets" on storage.objects;
create policy "Admin upload store assets" on storage.objects for insert to authenticated with check (bucket_id='store-assets' and public.is_admin());
drop policy if exists "Admin update store assets" on storage.objects;
create policy "Admin update store assets" on storage.objects for update to authenticated using (bucket_id='store-assets' and public.is_admin()) with check (bucket_id='store-assets' and public.is_admin());
drop policy if exists "Admin delete store assets" on storage.objects;
create policy "Admin delete store assets" on storage.objects for delete to authenticated using (bucket_id='store-assets' and public.is_admin());
