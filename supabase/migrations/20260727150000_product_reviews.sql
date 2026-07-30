-- Avis publics sur les produits digitaux de la Boutique.
-- Symétrique de la table reviews (missions) : un avis n'est possible que si
-- l'utilisateur a réellement acheté le produit (achat 'completed').

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.digital_products(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (product_id, client_id)
);

alter table public.product_reviews enable row level security;

drop policy if exists "Product reviews are publicly readable" on public.product_reviews;
create policy "Product reviews are publicly readable"
  on public.product_reviews for select
  using (true);

-- Un client ne peut noter qu'un produit qu'il a effectivement acheté (achat
-- 'completed'). Vérifié au niveau base, pas seulement dans l'UI.
drop policy if exists "Buyers can review purchased products" on public.product_reviews;
create policy "Buyers can review purchased products"
  on public.product_reviews for insert
  with check (
    auth.uid() = client_id
    and exists (
      select 1 from public.purchases
      where purchases.product_id = product_reviews.product_id
        and purchases.client_id = auth.uid()
        and purchases.status = 'completed'
    )
  );

create index if not exists product_reviews_product_idx on public.product_reviews (product_id);
