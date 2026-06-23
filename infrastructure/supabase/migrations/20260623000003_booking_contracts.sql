-- Tour/Event-Pakete (konfigurierbar durch Admin)
create table tour_packages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  event_type text check (event_type in ('FUEHRUNG', 'PRIVATE_EVENT', 'TASTING')),
  duration_minutes integer,
  min_participants integer default 2,
  max_participants integer default 30,
  price_per_person numeric(10,2),
  price_flat numeric(10,2),
  includes_catering boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

-- Unterzeichnete Verträge
create table event_contracts (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id),
  package_id uuid references tour_packages(id),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  company_name text,
  participant_count integer not null,
  requested_date date not null,
  requested_time time not null,
  special_requirements text,
  total_price numeric(10,2),
  contract_text text not null,
  status text check (status in ('DRAFT', 'ACCEPTED', 'CANCELLED')) default 'DRAFT',
  accepted_at timestamptz,
  accepted_by_name text,
  accepted_ip text,
  chat_transcript jsonb,
  created_at timestamptz default now()
);

-- RLS aktivieren
alter table tour_packages enable row level security;
alter table event_contracts enable row level security;

-- Öffentlicher Lesezugriff auf aktive Pakete (für Buchungsseite ohne Login)
create policy "public read active packages"
  on tour_packages for select
  using (active = true);

-- Öffentliches Anlegen von Verträgen
create policy "public create contracts"
  on event_contracts for insert
  with check (true);

-- Eigenen Vertrag per ID lesen
create policy "public read contracts"
  on event_contracts for select
  using (true);

-- Seed: Standard-Pakete
insert into tour_packages (name, description, event_type, duration_minutes, min_participants, max_participants, price_per_person, price_flat, includes_catering)
values
  ('Brauerei-Führung Standard', 'Klassische Führung durch die Brauerei inkl. 2 Verkostungen', 'FUEHRUNG', 90, 5, 25, 18.00, null, false),
  ('Brauerei-Führung Premium', 'Exklusive Führung mit Bierverkostung (5 Sorten) + Brotzeit', 'FUEHRUNG', 120, 8, 20, 35.00, null, true),
  ('Private Veranstaltung', 'Exklusiver Brauereiraum für private Veranstaltung', 'PRIVATE_EVENT', 240, 10, 80, null, 1200.00, false),
  ('Bier-Tasting', 'Geführtes Tasting mit 6 Biersorten + Experten-Kommentar', 'TASTING', 60, 4, 16, 22.00, null, false);
