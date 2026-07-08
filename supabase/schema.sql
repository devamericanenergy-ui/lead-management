-- ============================================================
-- Lead Management PWA — schema + Row Level Security
-- Run this in the Supabase SQL editor
-- ============================================================

-- Profiles: one row per auth user, extends auth.users
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  role text not null default 'salesperson' check (role in ('salesperson', 'admin')),
  created_at timestamptz not null default now()
);

-- Leads
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references profiles(id) on delete cascade,
  customer_name text not null,
  customer_phone text,
  address text,
  source text default 'other',
  status text not null default 'new'
    check (status in ('new', 'contacted', 'follow_up_scheduled', 'won', 'lost')),
  notes text,
  follow_up_at timestamptz,
  notified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_created_by_idx on leads (created_by);
create index if not exists leads_follow_up_at_idx on leads (follow_up_at);

-- Keep updated_at current
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  -- if follow_up_at changed, a new reminder should fire again
  if new.follow_up_at is distinct from old.follow_up_at then
    new.notified = false;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_set_updated_at on leads;
create trigger leads_set_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- Auto-create a profile row whenever a new auth user is created
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email), 'salesperson');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table leads enable row level security;

-- Profiles: a user can read their own profile; admins can read all
create policy "profiles_select_own_or_admin"
  on profiles for select
  using (
    id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles_update_own"
  on profiles for update
  using (id = auth.uid());

-- Leads: salesperson sees/edits only their own leads; admin sees/edits all
create policy "leads_select_own_or_admin"
  on leads for select
  using (
    created_by = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "leads_insert_own"
  on leads for insert
  with check (created_by = auth.uid());

create policy "leads_update_own_or_admin"
  on leads for update
  using (
    created_by = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "leads_delete_own_or_admin"
  on leads for delete
  using (
    created_by = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- Notes
-- ============================================================
-- 1. Accounts are created manually for now (Supabase Auth dashboard, or an
--    invite-only signup screen you add later) — no public self-signup.
-- 2. push_subscriptions table is intentionally left out of this MVP pass;
--    add it back when we wire up Web Push:
--
--    create table push_subscriptions (
--      id uuid primary key default gen_random_uuid(),
--      user_id uuid references profiles(id) on delete cascade,
--      subscription jsonb not null,
--      created_at timestamptz not null default now()
--    );
