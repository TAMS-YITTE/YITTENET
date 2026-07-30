# Edge Functions — paiement séquestre

Trois fonctions, à déployer avec la Supabase CLI (`npx supabase login`, `npx supabase link --project-ref <ref>`) :

```
npx supabase functions deploy create-checkout-session
npx supabase functions deploy release-escrow
npx supabase functions deploy stripe-webhook --no-verify-jwt
```

`stripe-webhook` doit être déployée avec `--no-verify-jwt` : Stripe appelle cet endpoint directement, sans JWT Supabase.

## Secrets à configurer

```
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
npx supabase secrets set SITE_URL=https://votre-domaine.vercel.app
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` sont injectées automatiquement, pas besoin de les définir.

## Côté Stripe

1. Créer un compte Stripe (mode test pour commencer) et récupérer `STRIPE_SECRET_KEY` (Dashboard → Développeurs → Clés API).
2. Créer un endpoint webhook pointant vers `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`, événement `checkout.session.completed`. Stripe fournit alors `STRIPE_WEBHOOK_SECRET`.
3. Le split automatique des paiements (Stripe Connect) suppose que chaque freelance a connecté un compte Stripe (`profiles.stripe_account_id`). **Cet onboarding Connect côté freelance n'est pas encore construit** — tant qu'il ne l'est pas, `create-checkout-session` retombe sur une charge classique vers le compte plateforme, sans reversement automatique.

## Ce qui n'est pas fait

- Onboarding Stripe Connect du freelance (flux `accountLinks.create` + retour vers Dashboard).
- Remboursement (`refunded`) en cas de litige — le statut existe dans `escrow_transactions` mais rien ne le déclenche encore.
