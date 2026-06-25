-- Monte Lab — Initial Schema
-- Blood Test Analysis Web App for Monte Hair Clinic

create extension if not exists "uuid-ossp";

-- Enums
create type report_status as enum ('pending', 'analyzing', 'ready', 'approved', 'rejected');
create type app_role as enum ('admin', 'doctor', 'staff');
create type gender_type as enum ('male', 'female', 'other');
create type notification_type as enum ('new_report', 'pending_approval', 'approved', 'rejected');

-- App Roles
create table public.app_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'staff',
  created_at timestamptz default now(),
  unique(user_id, role)
);

-- Patients
create table public.patients (
  id uuid primary key default uuid_generate_v4(),
  hn text unique not null,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  gender gender_type,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Doctors
create table public.doctors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  full_name text not null,
  license_no text not null,
  specialty text default 'Hair Restoration',
  signature_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reports
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references public.patients(id) on delete cascade not null,
  test_date date not null,
  lab_name text,
  status report_status default 'pending',
  raw_pdf_url text,
  summary_pdf_url text,
  parsed_values jsonb default '{}',
  analysis_json jsonb default '{}',
  ai_summary text,
  flags jsonb default '[]',
  approved_by uuid references public.doctors(id),
  approved_at timestamptz,
  rejection_reason text,
  source text default 'upload',
  gmail_message_id text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notifications
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type notification_type not null,
  title text not null,
  message text,
  report_id uuid references public.reports(id) on delete set null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Indexes
create index idx_reports_patient on public.reports(patient_id);
create index idx_reports_status on public.reports(status);
create index idx_reports_test_date on public.reports(test_date);
create index idx_reports_gmail_msg on public.reports(gmail_message_id);
create index idx_notifications_user on public.notifications(user_id, read);
create index idx_patients_hn on public.patients(hn);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_patients_updated before update on public.patients
  for each row execute function update_updated_at();
create trigger trg_doctors_updated before update on public.doctors
  for each row execute function update_updated_at();
create trigger trg_reports_updated before update on public.reports
  for each row execute function update_updated_at();

-- Role check helper
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean as $$
  select exists(
    select 1 from public.app_roles
    where user_id = _user_id and role = _role
  );
$$ language sql security definer stable;
