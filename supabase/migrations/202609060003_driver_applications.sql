create type public.driver_application_status as enum ('pending','under_review','approved','rejected','invited');

create table public.driver_applications(
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id),
  full_name text not null,
  dni_ciphertext text not null,
  dni_hash text unique not null,
  email text not null,
  phone text not null,
  taxi_license_number text not null,
  town text not null,
  province text not null,
  vehicle_make text not null,
  vehicle_model text not null,
  vehicle_plate text not null,
  vehicle_color text not null,
  seats smallint not null check(seats between 1 and 9),
  is_accessible boolean not null default false,
  notes text,
  privacy_accepted_at timestamptz not null,
  status public.driver_application_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  invited_user_id uuid references auth.users(id),
  invitation_email_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index driver_applications_status_idx on public.driver_applications(city_id,status,created_at desc);
alter table public.driver_applications enable row level security;
create policy driver_applications_admin_only on public.driver_applications for all using(is_admin()) with check(is_admin());

alter table public.profiles add column must_change_password boolean not null default false;

create or replace function public.mark_password_changed() returns void language plpgsql security definer set search_path=public as $$
begin
  update profiles set must_change_password=false,updated_at=now() where id=auth.uid();
  if not found then raise exception 'profile_not_found'; end if;
  insert into audit_logs(actor_profile_id,action,entity,entity_id) values(auth.uid(),'account.password_changed','profile',auth.uid()::text);
end $$;
revoke all on function public.mark_password_changed() from public,anon;
grant execute on function public.mark_password_changed() to authenticated;
