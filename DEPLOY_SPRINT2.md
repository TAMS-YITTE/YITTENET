# Déploiement — Sprint 2 (Chat, Conformité légale, Premium, Avis)

Checklist des étapes à faire **côté Supabase / Stripe** pour activer tout le code
livré dans le sprint 2. Le code est déjà écrit, buildé et vérifié — il ne manque
que l'application des migrations, le déploiement des fonctions et 2 secrets.

Projet Supabase : `xuxnsjkluuxmcefyzash`

---

## 1. Appliquer les 4 migrations SQL

Dans le **SQL Editor** de Supabase, exécuter (dans l'ordre) le contenu de :

- [ ] `supabase/migrations/20260727120000_chat.sql` — chat interne temps réel
- [ ] `supabase/migrations/20260727130000_legal_consent.sql` — consentement CGV/RGPD
- [ ] `supabase/migrations/20260727140000_premium_subscription.sql` — abonnement Premium
- [ ] `supabase/migrations/20260727150000_product_reviews.sql` — avis produits

> Toutes idempotentes (`if not exists`, `drop policy if exists`, `create or replace`) :
> sûres à rejouer.

### Vérification rapide (à coller dans le SQL Editor)
```sql
select
  (select count(*) from information_schema.tables
     where table_schema='public'
       and table_name in ('conversations','messages','product_reviews')) as tables,          -- attendu 3
  (select count(*) from information_schema.columns
     where table_schema='public' and table_name='profiles'
       and column_name in ('accepted_terms_at','accepted_privacy_at',
                            'is_premium','premium_status','stripe_customer_id',
                            'stripe_subscription_id','premium_current_period_end')) as cols,   -- attendu 7
  (select count(*) from pg_publication_tables
     where pubname='supabase_realtime' and tablename='messages') as realtime;                 -- attendu 1
```

---

## 2. Créer les 2 nouveaux secrets

### a) Clé DeepSeek
⚠️ **Révoquer d'abord l'ancienne clé** côté DeepSeek : elle a été exposée dans le
bundle client (ancienne variable `VITE_AI_API_KEY`). En générer une nouvelle.

### b) Prix Premium Stripe
Dans le dashboard Stripe (mode **test** d'abord) : créer un **produit** "YITTE Premium"
avec un **prix récurrent 49€ / mois**, puis copier son identifiant `price_...`.

### Poser les secrets
```bash
npx supabase secrets set DEEPSEEK_API_KEY=sk-xxxxx STRIPE_PREMIUM_PRICE_ID=price_xxxxx --project-ref xuxnsjkluuxmcefyzash
```

> Déjà configurés (ne pas retoucher) : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`.

---

## 3. Déployer les Edge Functions

```bash
npx supabase functions deploy generate-brief create-subscription-checkout customer-portal
```
```bash
npx supabase functions deploy stripe-webhook --no-verify-jwt
```

> `stripe-webhook` **doit** garder `--no-verify-jwt` (Stripe l'appelle sans JWT Supabase).

---

## 4. Configuration Stripe (dashboard)

- [ ] **Webhook** : sur l'endpoint existant `.../functions/v1/stripe-webhook`, ajouter les events :
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - (garder `checkout.session.completed` déjà en place)
- [ ] **Customer portal** : Settings → Billing → Customer portal → activer
  (permet aux freelances de gérer/résilier leur abonnement).

---

## 5. Activer la vraie IA côté front

Une fois `generate-brief` déployé et `DEEPSEEK_API_KEY` posé, dans `.env.local` :
```
VITE_AI_USE_MOCK=false
```
(puis rebuild / redeploy du front).

---

## 6. Tests de bout en bout à dérouler

- [ ] **Chat** : 2 comptes (client + freelance) sur une même mission → message temps réel sans refresh.
- [ ] **Conformité** : inscription bloquée tant que les 2 cases ne sont pas cochées ; vérifier `accepted_terms_at` / `accepted_privacy_at` remplis en base.
- [ ] **Premium** : `/premium` → paiement test → retour dashboard → badge Premium visible + profil remonté en tête de l'annuaire + gestion via portail.
- [ ] **Avis produit** : acheter un produit test → laisser un avis → visible publiquement sur la fiche.
- [ ] **IA** : publier un besoin via le générateur de brief (vérifier que ça passe bien par `generate-brief`, pas d'erreur de clé).

---

## Notes / limites connues

- **Split Connect freelance non construit** : les paiements (séquestre + produits) arrivent
  sur le compte plateforme ; le reversement au freelance est manuel pour l'instant.
- **Contenu juridique** (CGV / politique de confidentialité dans `src/pages/Legal.jsx`) :
  c'est une trame, à faire valider par un juriste. Email de contact : `contact@yitte.net`.
