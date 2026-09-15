create extension if not exists "pgcrypto";

create table if not exists public.cameras (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'AVAILABLE',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cameras_name_not_blank check (length(trim(name)) > 0),
  constraint cameras_status_check check (
    status in ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE')
  )
);

create table if not exists public.rentals (
  id uuid primary key default gen_random_uuid(),
  camera_id uuid not null references public.cameras(id) on delete restrict,
  customer_name text not null,
  customer_phone text,
  customer_address text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  rental_price numeric(12, 0) not null default 0,
  deposit_info text,
  status text not null default 'BOOKED',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rentals_customer_name_not_blank check (length(trim(customer_name)) > 0),
  constraint rentals_time_check check (end_time > start_time),
  constraint rentals_price_check check (rental_price >= 0),
  constraint rentals_status_check check (
    status in ('BOOKED', 'RENTING', 'RETURNED', 'CANCELLED')
  )
);

create index if not exists idx_rentals_camera_id on public.rentals(camera_id);
create index if not exists idx_rentals_start_time on public.rentals(start_time);
create index if not exists idx_rentals_end_time on public.rentals(end_time);
create index if not exists idx_rentals_status on public.rentals(status);
create index if not exists idx_rentals_camera_time_status
  on public.rentals(camera_id, start_time, end_time, status);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_cameras_updated_at on public.cameras;
create trigger set_cameras_updated_at
before update on public.cameras
for each row execute function public.set_updated_at();

drop trigger if exists set_rentals_updated_at on public.rentals;
create trigger set_rentals_updated_at
before update on public.rentals
for each row execute function public.set_updated_at();

alter table public.cameras enable row level security;
alter table public.rentals enable row level security;

drop policy if exists "Public can manage cameras" on public.cameras;
drop policy if exists "Public can manage rentals" on public.rentals;
drop policy if exists "Authenticated users can read cameras" on public.cameras;
drop policy if exists "Authenticated users can insert cameras" on public.cameras;
drop policy if exists "Authenticated users can update cameras" on public.cameras;
drop policy if exists "Authenticated users can delete cameras" on public.cameras;
drop policy if exists "Authenticated users can read rentals" on public.rentals;
drop policy if exists "Authenticated users can insert rentals" on public.rentals;
drop policy if exists "Authenticated users can update rentals" on public.rentals;
drop policy if exists "Authenticated users can delete rentals" on public.rentals;

create policy "Authenticated users can read cameras"
on public.cameras for select to authenticated using (true);
create policy "Authenticated users can insert cameras"
on public.cameras for insert to authenticated with check (true);
create policy "Authenticated users can update cameras"
on public.cameras for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete cameras"
on public.cameras for delete to authenticated using (true);

create policy "Authenticated users can read rentals"
on public.rentals for select to authenticated using (true);
create policy "Authenticated users can insert rentals"
on public.rentals for insert to authenticated with check (true);
create policy "Authenticated users can update rentals"
on public.rentals for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete rentals"
on public.rentals for delete to authenticated using (true);