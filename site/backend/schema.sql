-- Universal Fitment v0.4 relational core (PostgreSQL / Supabase target)
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table manufacturers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null,
  website_url text,
  unique(normalized_name)
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id),
  manufacturer_id uuid references manufacturers(id),
  model_name text not null,
  model_number text,
  product_type text,
  production_from date,
  production_to date,
  data_status text not null default 'unverified' check (data_status in ('demo','unverified','verified','deprecated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_identifiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  identifier_type text not null,
  identifier_value text not null,
  normalized_value text not null,
  source_id uuid,
  unique(identifier_type, normalized_value)
);

create table parts (
  id uuid primary key default gen_random_uuid(),
  manufacturer_id uuid references manufacturers(id),
  part_number text,
  normalized_part_number text,
  name text not null,
  part_type text,
  tier text not null default 'unknown' check (tier in ('oem','oe_quality','aftermarket','budget','unknown')),
  data_status text not null default 'unverified' check (data_status in ('demo','unverified','verified','deprecated'))
);

create table sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('manufacturer','catalog','regulator','merchant','community','prototype','other')),
  source_name text not null,
  source_url text,
  source_reference text,
  license_status text,
  retrieved_at timestamptz not null default now(),
  expires_at timestamptz
);

alter table product_identifiers add constraint fk_identifier_source foreign key (source_id) references sources(id);

create table compatibility_claims (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  part_id uuid not null references parts(id) on delete cascade,
  status text not null check (status in ('manufacturer_verified','catalog_verified','community_verified','probable','unknown','incompatible')),
  confidence numeric(5,4) not null check (confidence between 0 and 1),
  safety_class text not null default 'normal' check (safety_class in ('normal','caution','professional','restricted')),
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  unique(product_id, part_id, status, valid_from)
);

create table compatibility_evidence (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references compatibility_claims(id) on delete cascade,
  source_id uuid not null references sources(id),
  evidence_type text not null,
  reference_value text,
  notes text,
  created_at timestamptz not null default now()
);

create table cross_references (
  id uuid primary key default gen_random_uuid(),
  source_part_id uuid not null references parts(id) on delete cascade,
  target_part_id uuid not null references parts(id) on delete cascade,
  relationship text not null check (relationship in ('oem_equivalent','replacement','compatible_alternative','supersedes','superseded_by')),
  confidence numeric(5,4) check (confidence between 0 and 1),
  source_id uuid references sources(id),
  unique(source_part_id,target_part_id,relationship)
);

create table offers (
  id uuid primary key default gen_random_uuid(),
  part_id uuid not null references parts(id) on delete cascade,
  merchant text not null,
  external_id text,
  external_url text,
  affiliate_url text,
  price numeric(12,2),
  shipping numeric(12,2),
  currency char(3) not null default 'EUR',
  availability text,
  rating numeric(3,2),
  review_count integer,
  sponsored boolean not null default false,
  last_updated timestamptz not null default now(),
  unique(merchant, external_id)
);

create table manuals (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  title text not null,
  language_code text,
  external_url text not null,
  source_id uuid references sources(id),
  is_official boolean not null default false,
  unique(product_id, external_url)
);

create index idx_identifiers_normalized on product_identifiers(normalized_value);
create index idx_products_model_trgm on products using gin (model_name gin_trgm_ops);
create index idx_parts_number on parts(normalized_part_number);
create index idx_claim_product on compatibility_claims(product_id);
create index idx_claim_part on compatibility_claims(part_id);
create index idx_offer_part on offers(part_id);

-- v0.9: universal work packages and replenishment planning
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  code text not null,
  label text not null,
  summary text,
  evidence_status text not null default 'unknown',
  created_at timestamptz not null default now(),
  unique(product_id, code)
);

create table if not exists job_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  part_id uuid references parts(id) on delete set null,
  label text not null,
  role text not null check (role in ('required','recommended','consumable','care','optional')),
  required boolean not null default false,
  included_with_main boolean not null default false,
  reason text,
  evidence_source_id uuid references sources(id) on delete set null,
  sort_order integer not null default 0
);

create table if not exists inventory_plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  label text not null,
  unit text not null,
  current_stock numeric not null default 0,
  avg_days_per_unit numeric,
  lead_time_min_days integer,
  lead_time_max_days integer,
  safety_days integer not null default 0,
  supply_risk text not null default 'normal',
  reminder_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists inventory_events (
  id uuid primary key default gen_random_uuid(),
  inventory_plan_id uuid references inventory_plans(id) on delete cascade,
  event_type text not null check (event_type in ('purchase','consume','adjust','confirm_change')),
  quantity_delta numeric not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
