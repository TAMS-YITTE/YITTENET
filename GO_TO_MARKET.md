# 🚀 YITTENET - Checklist Go-to-Market (GTM)

Voici la feuille de route exacte pour lancer officiellement la plateforme en production.

---

## 🟢 Phase 1 : Faisable sans identifiants (Technique)

- [x] L'ensemble des failles critiques (audit) est corrigé.
- [x] Le code est propre, linté (`npm run lint` à 0 erreur) et optimisé pour le build Vercel.
- [x] L'intégration complète de Stripe Connect (Onboarding, Séquestre, Release, Webhooks) est finalisée.
- [x] Les templates HTML de base pour les emails sont prêts (dossier `supabase/email-templates/`).
- [x] Les scripts de migration de base de données sont consolidés.
- [x] Le `.env.local.example` est à jour pour les développeurs.

---

## 🟡 Phase 2 : Nécessite tes identifiants & actions (Lancement)

Cette partie doit être exécutée par tes soins depuis tes tableaux de bord.

### Stripe (Passage en Live)
- [ ] Dans ton Dashboard Stripe, clique sur le bouton en haut à droite pour désactiver le "Mode Test" et passer en "Mode Live".
- [ ] Active officiellement **Stripe Connect** en mode Live.
- [ ] Récupère tes clés de production : `sk_live_...` et ta clé publique `pk_live_...`.
- [ ] Recrée ton Endpoint de Webhook Stripe en mode Live (pointant vers `https://xuxnsjkluuxmcefyzash.supabase.co/functions/v1/stripe-webhook`) et récupère le nouveau secret `whsec_...`.
- [ ] Remplis le **KYC (Identity)** de Stripe si on te le demande (pièce d'identité, SIRET) pour lever les plafonds de paiement.

### Supabase (Configuration Prod)
- [ ] Dans les **Secrets** Supabase (Edge Functions), remplace `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` par tes nouvelles clés Live.
- [ ] Vérifie que `SITE_URL` est bien réglé sur `https://www.yitte.net`.
- [ ] Dans la section **Authentication > Email**, active un Custom SMTP (ex: Resend) pour t'assurer de la délivrabilité des emails d'inscription.
- [ ] Colle le contenu des fichiers HTML (`supabase/email-templates/`) dans la section **Email Templates**.

### Vercel (Frontend Prod)
- [ ] Vérifie que ton nom de domaine `www.yitte.net` pointe bien vers Vercel avec le certificat SSL actif (HTTPS).
- [ ] Vérifie que les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont bien renseignées dans l'onglet Environment Variables.

---

## 🔴 Phase 3 : Légal et Tests (Juriste / Fondateur)

- [ ] **Tests finaux en Prod** : Demande à un proche de créer un compte freelance, et crée-toi un compte client. Fais un vrai paiement (ex: 2€) avec ta carte bancaire personnelle et valide la livraison pour vérifier que le transfert bancaire arrive bien sur l'IBAN de test.
- [ ] **CGV / Mentions Légales** : Fais valider les pages `/cgv` et `/mentions-legales` par un juriste (le séquestre implique des responsabilités précises).
- [ ] **Analytics** : Installe un tracker (ex: Google Analytics, Plausible) pour mesurer tes premières visites de lancement.
