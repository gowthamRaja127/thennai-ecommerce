-- thennai storefront schema
-- Run in the Supabase SQL editor (or `supabase db push`). Then run supabase/seed.sql.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Admins: users listed here can manage products and read orders & analytics.
-- Add yourself after creating a user in Authentication → Users:
--   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(id) between 2 and 60),
  name text not null check (char_length(name) between 3 and 90),
  short_name text not null check (char_length(short_name) between 2 and 30),
  category text not null check (category in ('grow-tins', 'soil', 'gifts', 'refills')),
  badge text not null default '' check (char_length(badge) <= 40),
  price integer not null check (price between 1 and 100000),
  compare_at integer check (compare_at is null or compare_at > price),
  tagline text not null check (char_length(tagline) between 10 and 140),
  description text not null check (char_length(description) between 20 and 2000),
  contents text[] not null default '{}',
  how_to text[] not null default '{}',
  details text[] not null default '{}',
  variants text[] not null check (cardinality(variants) between 1 and 12),
  media jsonb not null default '[]'::jsonb check (jsonb_typeof(media) = 'array'),
  cta text not null default 'Add to Cart',
  active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Orders (written only by the server with the service-role key)
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id text primary key,
  status text not null check (status in ('pending_payment', 'paid', 'cod_confirmed', 'payment_failed', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null check (payment_method in ('razorpay', 'cod')),
  lines jsonb not null,
  subtotal integer not null,
  shipping_fee integer not null,
  total integer not null,
  contact jsonb not null,
  address jsonb not null,
  notes text not null default '',
  razorpay_order_id text unique,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
for each row execute function public.touch_updated_at();

create index if not exists orders_created_idx on public.orders (created_at desc);

-- ---------------------------------------------------------------------------
-- Analytics events (written only by the server; no personal data is stored)
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id bigint generated always as identity primary key,
  type text not null check (type in ('product_view', 'product_click', 'add_to_cart', 'begin_checkout', 'purchase')),
  product_id text not null,
  variant text,
  quantity integer,
  amount integer,          -- rupees, purchase events only
  source text,             -- e.g. 'shop-grid', 'product-page', 'landing'
  session_id text,
  order_id text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists events_product_type_time_idx on public.events (product_id, type, occurred_at desc);
create index if not exists events_time_idx on public.events (occurred_at desc);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.events enable row level security;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select to authenticated using (user_id = auth.uid());

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select to anon, authenticated using (active or public.is_admin());

drop policy if exists "products admin insert" on public.products;
create policy "products admin insert" on public.products for insert to authenticated with check (public.is_admin());

drop policy if exists "products admin update" on public.products;
create policy "products admin update" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products admin delete" on public.products;
create policy "products admin delete" on public.products for delete to authenticated using (public.is_admin());

drop policy if exists "orders admin read" on public.orders;
create policy "orders admin read" on public.orders for select to authenticated using (public.is_admin());

drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "events admin read" on public.events;
create policy "events admin read" on public.events for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Analytics: per-product engagement funnel and a daily series, admin only
-- ---------------------------------------------------------------------------
create or replace function public.product_engagement(since timestamptz)
returns table (
  product_id text,
  views bigint,
  clicks bigint,
  add_to_carts bigint,
  checkouts bigint,
  orders bigint,
  units bigint,
  revenue bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  return query
  select
    e.product_id,
    count(*) filter (where e.type = 'product_view'),
    count(*) filter (where e.type = 'product_click'),
    count(*) filter (where e.type = 'add_to_cart'),
    count(*) filter (where e.type = 'begin_checkout'),
    count(distinct e.order_id) filter (where e.type = 'purchase'),
    coalesce(sum(e.quantity) filter (where e.type = 'purchase'), 0)::bigint,
    coalesce(sum(e.amount) filter (where e.type = 'purchase'), 0)::bigint
  from public.events e
  where e.occurred_at >= since
  group by e.product_id;
end;
$$;

create or replace function public.engagement_daily(since timestamptz)
returns table (day date, views bigint, add_to_carts bigint, purchases bigint, revenue bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  return query
  select
    (e.occurred_at at time zone 'Asia/Kolkata')::date as day,
    count(*) filter (where e.type = 'product_view'),
    count(*) filter (where e.type = 'add_to_cart'),
    count(distinct e.order_id) filter (where e.type = 'purchase'),
    coalesce(sum(e.amount) filter (where e.type = 'purchase'), 0)::bigint
  from public.events e
  where e.occurred_at >= since
  group by 1
  order by 1;
end;
$$;

revoke all on function public.product_engagement(timestamptz) from public, anon;
revoke all on function public.engagement_daily(timestamptz) from public, anon;
grant execute on function public.product_engagement(timestamptz) to authenticated;
grant execute on function public.engagement_daily(timestamptz) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: product images (public read, admin write)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
