-- ADCStore v1.0.3 -> v1.0.4
-- Tujuan: owner otomatis, tanpa copy UUID / query manual.
-- Aman dijalankan pada project v1.0.3 yang sudah punya owner maupun yang belum.

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  make_owner boolean := false;
begin
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
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Project lama yang sudah memiliki user tetapi admin_users masih kosong:
-- user Authentication yang dibuat paling awal otomatis menjadi OWNER.
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

-- Pastikan user Auth yang belum punya profile tetap dibackfill.
insert into public.profiles(id,full_name,role)
select u.id,coalesce(u.raw_user_meta_data->>'full_name',''),
       case when exists(select 1 from public.admin_users a where a.user_id=u.id) then 'owner' else 'member' end
from auth.users u
on conflict (id) do update set
  role = case when exists(select 1 from public.admin_users a where a.user_id=excluded.id) then 'owner' else public.profiles.role end;
