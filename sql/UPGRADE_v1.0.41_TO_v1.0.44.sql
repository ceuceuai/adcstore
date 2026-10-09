-- ADCStore v1.0.41 -> v1.0.44 ONE-SHOT UPGRADE
-- Includes v1.0.42 multi-product checkout + v1.0.43 post-checkout redirect settings.
-- User does NOT need to install v1.0.42 first.

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
create policy "Anyone create order items" on public.order_items for insert to anon, authenticated with check (true);

drop policy if exists "Owner/member read order items" on public.order_items;
create policy "Owner/member read order items" on public.order_items for select to authenticated using (
  public.is_admin() or exists(
    select 1 from public.orders o
    where o.id=order_items.order_id
      and lower(o.customer_email)=lower(coalesce(auth.jwt()->>'email',''))
  )
);

drop policy if exists "Admin manage order items" on public.order_items;
create policy "Admin manage order items" on public.order_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Member read purchased access" on public.product_access;
create policy "Member read purchased access" on public.product_access for select to authenticated using (
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

alter table public.store_settings
  add column if not exists checkout_success_action text not null default 'whatsapp',
  add column if not exists checkout_success_url text;

alter table public.store_settings
  drop constraint if exists store_settings_checkout_success_action_check,
  add constraint store_settings_checkout_success_action_check
    check (checkout_success_action in ('whatsapp','url','none'));

select 'ADCStore v1.0.44 one-shot upgrade complete' as status;
