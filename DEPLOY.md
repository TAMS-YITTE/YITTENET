# 🚀 RUNBOOK : Déploiement en Production de YITTENET

Ce document contient la séquence **EXACTE** de mise en production. Suivez l'ordre à la lettre.

---

## A. Configuration des Secrets (Supabase)
Exécutez ces commandes dans le terminal (ou ajoutez-les via le Dashboard Supabase > Edge Functions > Secrets) :

```bash
# Nouveaux secrets
npx supabase secrets set GEMINI_API_KEY="votre_cle_gemini"
npx supabase secrets set STRIPE_PREMIUM_PRICE_ID="price_12345..."

# Rappel : Secrets déjà posés (à vérifier)
npx supabase secrets set STRIPE_SECRET_KEY="sk_live_..."
npx supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..."
npx supabase secrets set SITE_URL="https://www.yitte.net"
```

---

## B. Migrations SQL
Assurez-vous que toutes ces migrations sont appliquées sur la base de production (soit via `supabase db push`, soit en copiant le code dans le SQL Editor) dans cet ordre strict :

1. `20260727120000_chat.sql`
2. `20260727130000_legal_consent.sql`
3. `20260727140000_premium_subscription.sql`
4. `20260727150000_product_reviews.sql`
5. `20260728000000_add_legaltech_domain_check.sql`
6. `20260728100000_add_tjm.sql`
7. `20260731000000_availability_and_notifications.sql`
8. `20260731100000_connect_fields.sql`
9. `20260731100001_close_purchases_insert.sql`
10. `20260731100002_notifications_realtime.sql`

---

## C. Déploiement des Edge Functions
Déployez les fonctions backend. Attention au flag `--no-verify-jwt` indispensable pour le webhook Stripe.

```bash
npx supabase functions deploy generate-brief
npx supabase functions deploy create-connect-account
npx supabase functions deploy refresh-connect-status
npx supabase functions deploy create-checkout-session
npx supabase functions deploy release-escrow
npx supabase functions deploy create-product-checkout
npx supabase functions deploy create-subscription-checkout
npx supabase functions deploy customer-portal

# Attention : flag spécifique pour le webhook
npx supabase functions deploy stripe-webhook --no-verify-jwt
```

---

## D. Réglages Dashboard Stripe
Vérifiez que la plateforme de paiement est entièrement connectée :
1. **Activer Stripe Connect** (mode plateforme).
2. **Activer le Customer Portal** (Paramètres > Portail Client) pour que les freelances puissent gérer leur abonnement Premium.
3. **Configurer le Webhook** (Développeurs > Webhooks) pointant sur `https://[PROJECT_REF].supabase.co/functions/v1/stripe-webhook`.
4. **S'assurer que ces événements sont cochés :**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

---

## E. Emails Automatiques (SMTP Supabase)
Si vous utilisez un SMTP externe (Brevo, Resend, etc.), configurez-le dans **Authentication > Providers > Email**.
Ensuite, copiez le contenu HTML des fichiers situés dans le dossier `supabase/email-templates/` vers les encarts correspondants du Dashboard Supabase (Confirmation, Reset Password, Magic Link).

---

## F. Checklist de Test End-to-End (E2E)
Une fois tout déployé, effectuez une transaction blanche complète en production pour vérifier :

- [ ] Inscription d'un client et d'un freelance.
- [ ] Le freelance souscrit au "YITTE Premium" (vérifier le badge dans l'UI).
- [ ] Le client poste un besoin (le brief généré par Gemini s'affiche correctement).
- [ ] Le freelance fait une proposition, le client l'accepte.
- [ ] Le client paie la mission (Stripe Checkout).
- [ ] L'argent est mis sous séquestre (Dashboard).
- [ ] Le client valide la mission terminée.
- [ ] Les fonds sont libérés via Stripe Connect (-5% de commission grâce au Premium).
- [ ] Les notifications en temps réel s'affichent correctement (cloche).
