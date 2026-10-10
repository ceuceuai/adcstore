-- ADCStore DATABASE UPGRADE: v1.0.45 -> v1.0.53
-- REQUIRED because this release fixes checkout/order/access permissions and adds category parent_id.
-- Safe/idempotent where possible.

-- A. Category/subcategory hierarchy from v1.0.52.
alter table public.product_categories
  add column if not exists parent_id uuid;

alter table public.product_categories
  drop constraint if exists product_categories_parent_id_fkey,
  add constraint product_categories_parent_id_fkey
    foreign key (parent_id) references public.product_categories(id) on delete restrict;

create index if not exists product_categories_parent_id_idx
  on public.product_categories(parent_id);

alter table public.product_categories
  drop constraint if exists product_categories_not_self_parent,
  add constraint product_categories_not_self_parent
    check (parent_id is null or parent_id <> id);

-- B. Ensure multi-product order items exists.
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

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.product_access enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.orders to anon, authenticated;
grant insert on public.order_items to anon, authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select, insert, update, delete on public.product_access to authenticated;

-- C. Repair checkout/order RLS.
drop policy if exists "Anyone create order" on public.orders;
create policy "Anyone create order"
on public.orders for insert to anon, authenticated
with check (true);

drop policy if exists "Member read own orders" on public.orders;
create policy "Member read own orders"
on public.orders for select to authenticated
using (
  public.is_admin()
  or lower(customer_email)=lower(coalesce(auth.jwt()->>'email',''))
);

drop policy if exists "Admin manage orders" on public.orders;
create policy "Admin manage orders"
on public.orders for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Anyone create order items" on public.order_items;
create policy "Anyone create order items"
on public.order_items for insert to anon, authenticated
with check (true);

drop policy if exists "Owner/member read order items" on public.order_items;
create policy "Owner/member read order items"
on public.order_items for select to authenticated
using (
  public.is_admin()
  or exists(
    select 1
    from public.orders o
    where o.id=order_items.order_id
      and lower(o.customer_email)=lower(coalesce(auth.jwt()->>'email',''))
  )
);

drop policy if exists "Admin manage order items" on public.order_items;
create policy "Admin manage order items"
on public.order_items for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- D. Product access: owner manages, paid/completed buyer reads own products.
drop policy if exists "Member read purchased access" on public.product_access;
create policy "Member read purchased access"
on public.product_access for select to authenticated
using (
  public.is_admin()
  or (
    is_active=true
    and (
      exists(
        select 1
        from public.orders o
        where o.product_id=product_access.product_id
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

drop policy if exists "Admin manage product access" on public.product_access;
create policy "Admin manage product access"
on public.product_access for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- E. Atomic checkout RPC. This is the path used by v1.0.53 frontend.
create or replace function public.create_checkout_order(
  p_order_number text,
  p_customer_name text,
  p_customer_email text,
  p_customer_whatsapp text,
  p_payment_method text,
  p_product_ids uuid[]
)
returns table(order_id uuid, order_number text, total_amount numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_total numeric(14,2) := 0;
  v_requested integer := 0;
  v_valid integer := 0;
  v_first_product uuid;
begin
  if p_product_ids is null or array_length(p_product_ids,1) is null then
    raise exception 'Tidak ada produk di checkout.';
  end if;

  if coalesce(trim(p_customer_name),'') = ''
     or coalesce(trim(p_customer_email),'') = ''
     or coalesce(trim(p_customer_whatsapp),'') = '' then
    raise exception 'Data pembeli belum lengkap.';
  end if;

  select count(*) into v_requested
  from (select distinct unnest(p_product_ids) as id) q;

  select count(*), coalesce(sum(p.price),0)
    into v_valid, v_total
  from public.products p
  join (select distinct unnest(p_product_ids) as id) q on q.id=p.id
  where p.is_active=true
    and p.sale_mode in ('internal','both');

  if v_valid <> v_requested then
    raise exception 'Ada produk yang tidak valid atau tidak tersedia untuk checkout internal.';
  end if;

  select id into v_first_product
  from (select distinct unnest(p_product_ids) as id) q
  limit 1;

  insert into public.orders(
    id,order_number,product_id,customer_name,customer_email,
    customer_whatsapp,amount,payment_method,status
  )
  values(
    v_order_id,p_order_number,v_first_product,trim(p_customer_name),lower(trim(p_customer_email)),
    trim(p_customer_whatsapp),v_total,p_payment_method,'pending'
  );

  insert into public.order_items(order_id,product_id,product_name,price,quantity,subtotal)
  select v_order_id,p.id,p.name,p.price,1,p.price
  from public.products p
  join (select distinct unnest(p_product_ids) as id) q on q.id=p.id
  where p.is_active=true
    and p.sale_mode in ('internal','both');

  return query select v_order_id,p_order_number,v_total;
end;
$$;

grant execute on function public.create_checkout_order(text,text,text,text,text,uuid[]) to anon, authenticated;

notify pgrst, 'reload schema';

select
  has_table_privilege('anon','public.orders','INSERT') as anon_can_insert_order,
  has_table_privilege('anon','public.order_items','INSERT') as anon_can_insert_order_items,
  has_function_privilege('anon','public.create_checkout_order(text,text,text,text,text,uuid[])','EXECUTE') as anon_can_checkout_rpc;
