alter publication supabase_realtime add table public.driver_applications,public.drivers,public.driver_duty_shifts;

comment on table public.driver_applications is 'Professional driver applications; realtime changes are filtered by admin RLS.';
