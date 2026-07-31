-- Supprime la policy d'insert ouverte sur purchases (faille critique).
-- Les achats sont crees uniquement par le webhook Stripe en service_role,
-- qui bypass la RLS. Aucune policy d'insert n'est necessaire ni recreee.
drop policy if exists "Service can insert purchases" on public.purchases;