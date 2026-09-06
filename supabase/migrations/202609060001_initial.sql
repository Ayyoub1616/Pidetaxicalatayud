create extension if not exists pgcrypto;

create type public.app_role as enum ('SUPERADMIN','CITY_ADMIN','ADMIN','DRIVER');
create type public.driver_availability as enum ('available','busy','unavailable');
create type public.driver_account_status as enum ('active','suspended','inactive');
create type public.booking_status as enum ('requested','dispatching','accepted','driver_en_route','driver_arrived','in_progress','completed','cancelled','no_driver_available');
create type public.booking_kind as enum ('immediate','scheduled');
create type public.offer_status as enum ('pending','accepted','rejected','expired','cancelled');
create type public.complaint_status as enum ('new','in_review','resolved','archived');

create table public.cities(id uuid primary key default gen_random_uuid(), name text not null, province text not null, country text not null, timezone text not null default 'Europe/Madrid', active boolean not null default true, created_at timestamptz not null default now());
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade, role public.app_role not null, city_id uuid references public.cities(id), full_name text not null, phone text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.drivers(id uuid primary key default gen_random_uuid(), profile_id uuid unique references public.profiles(id), city_id uuid not null references public.cities(id), first_name text not null, last_name text not null default '', phone text not null, email text, license_number text, vehicle_plate text, vehicle_make text, vehicle_model text, vehicle_color text, seats smallint not null default 4 check(seats between 1 and 9), is_accessible boolean not null default false, internal_notes text, dispatch_priority integer not null default 100, availability_status public.driver_availability not null default 'unavailable', availability_updated_at timestamptz not null default now(), account_status public.driver_account_status not null default 'active', accepts_future_bookings boolean not null default true, last_assigned_at timestamptz, deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.driver_devices(id uuid primary key default gen_random_uuid(), driver_id uuid not null references public.drivers(id) on delete cascade, name text not null, platform text, last_seen_at timestamptz, created_at timestamptz not null default now());
create table public.driver_push_subscriptions(id uuid primary key default gen_random_uuid(), driver_id uuid not null references public.drivers(id) on delete cascade, device_id uuid references public.driver_devices(id) on delete cascade, endpoint text unique not null, p256dh text not null, auth text not null, user_agent text, invalidated_at timestamptz, created_at timestamptz not null default now());
create table public.driver_duty_shifts(id uuid primary key default gen_random_uuid(), driver_id uuid not null references public.drivers(id), starts_at timestamptz not null, ends_at timestamptz not null check(ends_at>starts_at), notes text, recurrence_group_id uuid, created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index duty_current_idx on public.driver_duty_shifts(driver_id,starts_at,ends_at);

create table public.bookings(id uuid primary key default gen_random_uuid(), city_id uuid not null references public.cities(id), public_token_hash text unique not null, booking_kind public.booking_kind not null, scheduled_for timestamptz, pickup_address text not null, pickup_lat double precision, pickup_lng double precision, destination_address text, destination_lat double precision, destination_lng double precision, passenger_count smallint not null check(passenger_count between 1 and 9), customer_name text not null, customer_phone text not null, customer_email text, customer_notes text, accessible_required boolean not null default false, status public.booking_status not null default 'requested', assigned_driver_id uuid references public.drivers(id), assigned_manually boolean not null default false, assigned_by_admin uuid references public.profiles(id), accepted_at timestamptz, driver_en_route_at timestamptz, driver_arrived_at timestamptz, started_at timestamptz, completed_at timestamptz, cancelled_at timestamptz, cancellation_reason text, dispatch_attempt integer not null default 0, ip_hash text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index bookings_active_idx on public.bookings(city_id,status,scheduled_for,created_at);
create index bookings_phone_idx on public.bookings(customer_phone,created_at desc);
create table public.booking_offers(id uuid primary key default gen_random_uuid(), booking_id uuid not null references public.bookings(id) on delete cascade, driver_id uuid not null references public.drivers(id), round smallint not null default 1, status public.offer_status not null default 'pending', expires_at timestamptz not null, responded_at timestamptz, created_at timestamptz not null default now(), unique(booking_id,driver_id,round));
create index offers_driver_idx on public.booking_offers(driver_id,status,expires_at);
create table public.booking_events(id bigint generated always as identity primary key, booking_id uuid not null references public.bookings(id) on delete cascade, event_type text not null, actor_profile_id uuid references public.profiles(id), actor_type text not null check(actor_type in ('system','admin','driver','customer')), metadata jsonb not null default '{}', created_at timestamptz not null default now());
create table public.ratings(id uuid primary key default gen_random_uuid(), booking_id uuid unique not null references public.bookings(id), driver_id uuid not null references public.drivers(id), review_token_hash text unique not null, punctuality smallint check(punctuality between 1 and 5), treatment smallint check(treatment between 1 and 5), cleanliness smallint check(cleanliness between 1 and 5), driving smallint check(driving between 1 and 5), overall smallint check(overall between 1 and 5), comment text, incident boolean not null default false, submitted_at timestamptz, expires_at timestamptz not null, created_at timestamptz not null default now());
create table public.complaints(id uuid primary key default gen_random_uuid(), booking_id uuid not null references public.bookings(id), rating_id uuid references public.ratings(id), driver_id uuid references public.drivers(id), status public.complaint_status not null default 'new', customer_comment text, admin_notes text, shareable_notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.notification_logs(id bigint generated always as identity primary key, driver_id uuid references public.drivers(id), booking_id uuid references public.bookings(id), channel text not null, event_key text unique, status text not null, error_message text, metadata jsonb not null default '{}', created_at timestamptz not null default now());
create table public.audit_logs(id bigint generated always as identity primary key, actor_profile_id uuid references public.profiles(id), action text not null, entity text not null, entity_id text, metadata jsonb not null default '{}', created_at timestamptz not null default now());
create table public.app_settings(city_id uuid primary key references public.cities(id), offer_seconds integer not null default 20, first_round_size integer not null default 2, second_round_size integer not null default 3, round_delay_seconds integer not null default 20, max_attempts integer not null default 3, guard_priority boolean not null default true, dispatch_algorithm text not null default 'GUARD_PRIORITY_ROUND_ROBIN', review_delay_minutes integer not null default 120, reminder_1_minutes integer not null default 120, reminder_2_minutes integer not null default 30, show_vehicle_plate boolean not null default false, allow_empty_destination boolean not null default false, sms_enabled boolean not null default false, email_enabled boolean not null default true, maintenance_mode boolean not null default false, updated_at timestamptz not null default now());

create or replace function public.current_role() returns public.app_role language sql stable security definer set search_path=public as $$ select role from profiles where id=auth.uid() $$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select coalesce(current_role() in ('SUPERADMIN','CITY_ADMIN','ADMIN'),false) $$;
create or replace function public.current_driver_id() returns uuid language sql stable security definer set search_path=public as $$ select id from drivers where profile_id=auth.uid() and account_status='active' $$;

create or replace function public.accept_booking_offer(p_offer_id uuid) returns public.bookings language plpgsql security definer set search_path=public as $$
declare v_offer booking_offers; v_booking bookings; v_driver uuid;
begin
  v_driver:=current_driver_id(); if v_driver is null then raise exception 'not_authorized'; end if;
  select * into v_offer from booking_offers where id=p_offer_id and driver_id=v_driver for update;
  if not found or v_offer.status<>'pending' or v_offer.expires_at<=now() then raise exception 'offer_not_available'; end if;
  select * into v_booking from bookings where id=v_offer.booking_id for update;
  if v_booking.assigned_driver_id is not null or v_booking.status not in ('requested','dispatching') then raise exception 'booking_already_taken'; end if;
  update bookings set assigned_driver_id=v_driver,status='accepted',accepted_at=now(),updated_at=now() where id=v_booking.id returning * into v_booking;
  update booking_offers set status=case when id=p_offer_id then 'accepted'::offer_status else 'cancelled'::offer_status end,responded_at=now() where booking_id=v_booking.id and status='pending';
  update drivers set last_assigned_at=now() where id=v_driver;
  insert into booking_events(booking_id,event_type,actor_profile_id,actor_type,metadata) values(v_booking.id,'accepted',auth.uid(),'driver',jsonb_build_object('offer_id',p_offer_id));
  insert into audit_logs(actor_profile_id,action,entity,entity_id) values(auth.uid(),'booking.accept','booking',v_booking.id::text);
  return v_booking;
end $$;

alter table public.profiles enable row level security; alter table public.drivers enable row level security; alter table public.driver_devices enable row level security; alter table public.driver_push_subscriptions enable row level security; alter table public.driver_duty_shifts enable row level security; alter table public.bookings enable row level security; alter table public.booking_offers enable row level security; alter table public.booking_events enable row level security; alter table public.ratings enable row level security; alter table public.complaints enable row level security; alter table public.notification_logs enable row level security; alter table public.audit_logs enable row level security; alter table public.app_settings enable row level security;

create policy profiles_self_or_admin on public.profiles for select using(id=auth.uid() or is_admin());
create policy drivers_self_or_admin on public.drivers for select using(profile_id=auth.uid() or is_admin());
create policy drivers_admin_write on public.drivers for all using(is_admin()) with check(is_admin());
create policy duty_driver_read on public.driver_duty_shifts for select using(driver_id=current_driver_id() or is_admin());
create policy duty_admin_write on public.driver_duty_shifts for all using(is_admin()) with check(is_admin());
create policy offers_driver_read on public.booking_offers for select using(driver_id=current_driver_id() or is_admin());
create policy bookings_driver_read on public.bookings for select using(assigned_driver_id=current_driver_id() or is_admin() or exists(select 1 from booking_offers o where o.booking_id=id and o.driver_id=current_driver_id() and o.status='pending' and o.expires_at>now()));
create policy events_driver_read on public.booking_events for select using(is_admin() or exists(select 1 from bookings b where b.id=booking_id and b.assigned_driver_id=current_driver_id()));
create policy ratings_admin_only on public.ratings for all using(is_admin()) with check(is_admin());
create policy complaints_admin_only on public.complaints for all using(is_admin()) with check(is_admin());
create policy logs_admin_only on public.notification_logs for select using(is_admin());
create policy audit_admin_only on public.audit_logs for select using(is_admin());
create policy settings_read_staff on public.app_settings for select using(current_role() is not null);
create policy settings_admin_write on public.app_settings for all using(is_admin()) with check(is_admin());
create policy own_devices on public.driver_devices for all using(driver_id=current_driver_id() or is_admin()) with check(driver_id=current_driver_id() or is_admin());
create policy own_push on public.driver_push_subscriptions for all using(driver_id=current_driver_id() or is_admin()) with check(driver_id=current_driver_id() or is_admin());

revoke all on function public.accept_booking_offer(uuid) from public,anon; grant execute on function public.accept_booking_offer(uuid) to authenticated;
alter publication supabase_realtime add table public.bookings,public.booking_offers;
