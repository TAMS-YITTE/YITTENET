-- Boutique YITTE : produits digitaux (templates, scripts, smart contracts...)
-- vendus par les freelances. Table + table d'achats + RLS.

create table if not exists public.digital_products (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 200),
  description text not null check (char_length(description) between 10 and 5000),
  category text not null check (category in ('web3', 'genai', 'nocode', 'legaltech')),
  price integer not null check (price > 0),
  file_url text,
  cover_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.digital_products(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  stripe_payment_id text,
  status text not null default 'completed' check (status in ('pending', 'completed', 'refunded')),
  created_at timestamptz not null default now(),
  unique (product_id, client_id)
);

alter table public.digital_products enable row level security;
alter table public.purchases enable row level security;

drop policy if exists "Digital products are publicly readable" on public.digital_products;
create policy "Digital products are publicly readable"
  on public.digital_products for select
  using (true);

drop policy if exists "Freelancers can manage their own products" on public.digital_products;
create policy "Freelancers can manage their own products"
  on public.digital_products for insert
  with check (auth.uid() = freelancer_id);

drop policy if exists "Freelancers can update their own products" on public.digital_products;
create policy "Freelancers can update their own products"
  on public.digital_products for update
  using (auth.uid() = freelancer_id)
  with check (auth.uid() = freelancer_id);

drop policy if exists "Freelancers can delete their own products" on public.digital_products;
create policy "Freelancers can delete their own products"
  on public.digital_products for delete
  using (auth.uid() = freelancer_id);

drop policy if exists "Buyers and sellers can view purchases" on public.purchases;
create policy "Buyers and sellers can view purchases"
  on public.purchases for select
  using (
    auth.uid() = client_id
    or exists (
      select 1 from public.digital_products dp
      where dp.id = purchases.product_id
        and dp.freelancer_id = auth.uid()
    )
  );

drop policy if exists "Service can insert purchases" on public.purchases;
create policy "Service can insert purchases"
  on public.purchases for insert
  with check (true);

create index if not exists digital_products_category_idx on public.digital_products (category);
create index if not exists purchases_client_idx on public.purchases (client_id);
create index if not exists purchases_product_idx on public.purchases (product_id);
