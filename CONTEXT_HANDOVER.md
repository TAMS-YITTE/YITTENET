# Contexte du Projet : YITTENET (Août 2026)

*Ce document sert de point de départ pour toute nouvelle conversation avec une IA. Il résume l'état actuel de l'application, la stack technique et les fonctionnalités en place.*

## 1. Stack Technique
- **Frontend** : React 19, Vite 8, React Router v7, Lucide React (Icônes).
- **Backend / BaaS** : Supabase (PostgreSQL, Authentification, Storage, Realtime).
- **Fonctions Serverless** : Supabase Edge Functions (Deno / TypeScript).
- **Paiements** : Stripe (Checkout, Connect pour les freelances, Billing pour les abonnements).
- **Intelligence Artificielle** : Google Gemini 1.5 Flash (via Edge Function).
- **Hébergement** : Vercel (Frontend), Cloudflare (DNS), Hostinger (Emails).
- **SEO & Analytics** : `react-helmet-async` (Balises dynamiques), `@vercel/analytics`.

## 2. Architecture & Fonctionnalités Principales

### A. La Marketplace (Missions)
- **Rôles** : Clients et Freelances (Web3, IA Générative, No-Code).
- **Processus de mission** : 
  1. Le client poste un besoin brut.
  2. L'IA (Gemini) génère un cahier des charges structuré.
  3. Paiement du client via Stripe Checkout.
  4. L'argent est bloqué sous séquestre (Escrow) dans le compte Stripe Connect de Yitte.
  5. À la fin de la mission, validation par le client -> Libération des fonds vers le compte Stripe Connect du freelance.

### B. Modèle Économique (Commissions & Premium)
- **Commission standard** : 10% prélevés sur les missions.
- **Abonnement "YITTE Premium"** : 49€/mois via Stripe Billing. Réduit la commission à 5% et donne un badge exclusif sur le profil.
- **Boutique SaaS / Produits Digitaux** : Vente de scripts, templates et accès SaaS avec paiements directs.

### C. Fonctionnalités Avancées
- **Chat en Temps Réel** : Communication entre client et freelance via Supabase Realtime.
- **Notifications** : Système d'alertes en temps réel dans l'interface (cloche).
- **Génération de profils** : Algorithme de matching basé sur les compétences et le domaine.

## 3. État Actuel (Production)
L'application est **terminée (V1) et déployée en production**.
- Le code source est propre, optimisé pour le SEO (Sitemap, Robots.txt) et les balises OpenGraph sont en place.
- Les webhooks Stripe fonctionnent correctement (Gestion du cycle de vie des abonnements Premium et des paiements de missions).
- Les migrations SQL et les Edge Functions sont déployées sur le projet Supabase de production.

## 4. Fichiers Stratégiques à connaître
- `DEPLOY.md` : Le Runbook détaillé qui liste tous les secrets, les commandes de déploiement et l'ordre des migrations.
- `GO_TO_MARKET.md` : La stratégie de lancement commercial.
- `supabase_schema.sql` (ou les fichiers dans `supabase/migrations/`) : La structure complète de la base de données.

---
**Note pour l'Agent IA :** 
Tu as désormais tout le contexte. Attends les instructions de l'utilisateur pour la prochaine tâche (correction de bug, ajout d'une feature V2, ou analyse de logs).
