-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enum types
create type barrel_status as enum (
  'CREATED', 'AVAILABLE', 'FILLED', 'DELIVERED', 'AT_CUSTOMER', 
  'EMPTY_REPORTED', 'RETURNED', 'CLEANING', 'MAINTENANCE', 
  'DAMAGED', 'LOST', 'RETIRED'
);

-- Customers
create table customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  address text,
  customer_type text check (customer_type in ('GASTRO', 'RETAIL', 'PRIVATE')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Beers
create table beers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text,
  description text,
  created_at timestamptz default now()
);

-- Batches (Chargen)
create table batches (
  id uuid primary key default uuid_generate_v4(),
  beer_id uuid references beers(id),
  batch_number text not null unique,
  brewed_at timestamptz default now(),
  best_before date,
  created_at timestamptz default now()
);

-- Barrels
create table barrels (
  id uuid primary key default uuid_generate_v4(),
  barrel_number text not null unique,
  size_liters integer not null, -- 10, 30, 200
  material text default 'WOOD',
  status barrel_status default 'CREATED',
  current_batch_id uuid references batches(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RFID Tags
create table rfid_tags (
  id uuid primary key default uuid_generate_v4(),
  rfid_uid text not null unique,
  barrel_id uuid references barrels(id),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Barrel Movements
create table barrel_movements (
  id uuid primary key default uuid_generate_v4(),
  barrel_id uuid references barrels(id),
  customer_id uuid references customers(id),
  from_status barrel_status,
  to_status barrel_status,
  location_type text, -- 'BREWERY', 'CUSTOMER', 'TRANSIT'
  moved_by uuid, -- user_id
  notes text,
  created_at timestamptz default now()
);

-- Deposit Accounts (Pfandkonten)
create table deposit_accounts (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) unique,
  balance numeric(10, 2) default 0.00,
  updated_at timestamptz default now()
);

-- Deposit Transactions
create table deposit_transactions (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references deposit_accounts(id),
  amount numeric(10, 2) not null,
  transaction_type text check (transaction_type in ('PAYOUT', 'REFUND', 'CHARGED')),
  reference_movement_id uuid references barrel_movements(id),
  created_at timestamptz default now()
);

-- Cleaning Records
create table cleaning_records (
  id uuid primary key default uuid_generate_v4(),
  barrel_id uuid references barrels(id),
  cleaned_at timestamptz default now(),
  cleaned_by uuid,
  detergent_used text,
  notes text
);

-- Maintenance Records
create table maintenance_records (
  id uuid primary key default uuid_generate_v4(),
  barrel_id uuid references barrels(id),
  maintenance_type text,
  performed_at timestamptz default now(),
  performed_by uuid,
  notes text
);

-- Damage Reports
create table damage_reports (
  id uuid primary key default uuid_generate_v4(),
  barrel_id uuid references barrels(id),
  reported_by uuid,
  description text,
  photo_url text,
  severity text,
  created_at timestamptz default now()
);

-- Products (Merch, non-beer items)
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10, 2),
  stock_quantity integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id),
  status text check (status in ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED')),
  total_amount numeric(10, 2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Events
create table events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz,
  location text,
  max_participants integer,
  created_at timestamptz default now()
);

-- Event Bookings
create table event_bookings (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id),
  customer_id uuid references customers(id),
  status text check (status in ('CONFIRMED', 'CANCELLED', 'WAITLIST')),
  tickets_count integer default 1,
  created_at timestamptz default now()
);

-- Audit Logs
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  table_name text,
  record_id uuid,
  action text,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid,
  created_at timestamptz default now()
);

-- Profiles (Public user data linked to Auth)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role_id text, -- references one of our custom roles
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_barrels_status on barrels(status);
create index idx_rfid_tags_uid on rfid_tags(rfid_uid);
create index idx_barrel_movements_barrel on barrel_movements(barrel_id);
create index idx_barrel_movements_customer on barrel_movements(customer_id);
create index idx_audit_logs_record on audit_logs(record_id);
create index idx_orders_customer on orders(customer_id);
create index idx_event_bookings_event on event_bookings(event_id);
create index idx_profiles_user on profiles(id);
