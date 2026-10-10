-- ADCStore v1.0.48 - ANALYTICS DATABASE REPAIR
-- REQUIRED ONCE if Analytics dashboard stays at 0.
-- Safe to run when analytics_events already exists.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_view','product_view','salespage_click','checkout_click','whatsapp_click','banner_click','purchase')),
  product_id uuid references public.products(id) on delete set null,
  page_path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);
create index if not exists analytics_events_type_idx on public.analytics_events(event_type);
create index if not exists analytics_events_product_idx on public.analytics_events(product_id);

alter table public.analytics_events enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.analytics_events to anon, authenticated;
grant select, delete on public.analytics_events to authenticated;

drop policy if exists "Public insert analytics" on public.analytics_events;
create policy "Public insert analytics"
on public.analytics_events
for insert
to anon, authenticated
with check (true);

drop policy if exists "Admin read analytics" on public.analytics_events;
create policy "Admin read analytics"
on public.analytics_events
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admin delete analytics" on public.analytics_events;
create policy "Admin delete analytics"
on public.analytics_events
for delete
to authenticated
using (public.is_admin());

notify pgrst, 'reload schema';

select
  has_table_privilege('anon','public.analytics_events','INSERT') as anon_can_insert,
  has_table_privilege('authenticated','public.analytics_events','SELECT') as auth_can_select,
  public.is_admin() as current_user_is_admin;
