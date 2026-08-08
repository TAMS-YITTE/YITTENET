# Contexte YITTE — brief de reprise

> À coller en début de conversation. État vérifié par exécution le **08/08/2026**.
> Tout ce qui suit a été constaté dans le code, pas supposé.
> Révision du 08/08/2026 (soir) : §2, §5, §7, §8 mis à jour après la refonte de la page
> catalogue de Yittenet. Les passages modifiés sont signalés par « MàJ ».

---

## 1. Le projet

Écosystème de SaaS B2B sous le domaine **yitte.net**, avec une ouverture sur l'Afrique de
l'Ouest (Dakar, Abidjan). Dossiers dans `C:\Users\hp\Documents\`.

**Le facteur limitant n'est ni le code ni les idées : c'est la DISTRIBUTION.**
Plus de 17 applications existent. Aucun client payant. Aucun de ces produits ne se vend en
self-service sur ces marchés.

---

## 2. Règles d'architecture — tranchées, ne pas rediscuter

- Chaque produit est **autonome et vendable seul** : dossier séparé, sous-domaine dédié,
  **base de données séparée**. Pas de monorepo, pas de base commune, pas de SSO, pas de
  compte unique, pas de page « Mes SaaS », pas de provisioning cross-produit.
- **Un compte Stripe par produit.** Centraliser serait légal (même entité) mais casse la
  revente à l'unité.
- **Yittenet est une VITRINE**, pas un canal de vente. Il liste et pointe. Une vitrine
  n'apporte pas de clients — c'est une preuve d'existence.
- Stack standard : React 19 + Vite + TypeScript, pattern
  `types.ts → seed.ts → repositories.ts → App.tsx`, LocalStorage phase 1, Supabase phase 2
  sans changer l'interface du repository.

### ⚠️ MàJ — la règle « vitrine » est enfreinte dans le code actuel

Le 08/08/2026, `/solutions` a été créée dans Yittenet avec une **vraie caisse Stripe**
(Edge Function `create-saas-checkout`, redirection Checkout, price_id des 6 produits).
C'est le mécanisme que la règle interdit, réécrit proprement en JSX.

Trois conséquences si on le garde :
- Yittenet devient un canal de vente et encaisse pour le compte d'autres produits ;
- l'encaissement se fait sur **le compte Stripe de Yittenet**, pas celui du produit —
  contraire à « un compte Stripe par produit », et c'est précisément ce qui complique une
  revente à l'unité ;
- rien n'est provisionné côté produit après paiement : le client paie et atterrit sur un
  sous-domaine qui ne sait pas qu'il a payé.

**Rien n'est déployé.** La function n'est pas poussée et aucun price_id n'est renseigné :
en l'état les boutons « S'abonner » ne s'affichent même pas. Le retour arrière coûte la
suppression de trois fichiers. **À trancher avant de déployer, pas après.**

---

## 3. Règles produit — non négociables

1. **Ne jamais afficher un résultat qui n'a pas été réellement calculé ou obtenu.** Si une
   fonction ne peut pas marcher (clé absente, backend absent, donnée manquante), l'app
   l'écrit **à l'écran**. Interdits : faux PDF, faux envoi, faux score, données de démo
   présentées comme réelles.
2. **Jamais de détention de fonds de tiers.** Aucun encaissement, séquestre ou cagnotte.
   L'app suit un paiement, elle ne le porte pas.
3. **WhatsApp, jamais SMS** sur les marchés ouest-africains.
4. **Multi-devises XOF / EUR** partout où de l'argent s'affiche.

---

## 4. LE PIÈGE CENTRAL — « le zéro qui ment »

Défaut trouvé dans 5 applications, corrigé dans 3, **revenu deux fois** après correction.

Le motif : quand un calcul est impossible, le code renvoie `0`. Or zéro est une valeur, et
dans un ratio financier c'est souvent la **meilleure note possible**.

Exemple réel : une entreprise à CAF nulle affichait « Dettes / CAF = 0 année », soit un
remboursement instantané — le meilleur score du rapport, attribué à l'entreprise la plus en
difficulté.

Pire cas trouvé : le score de santé de FinAnalyse donnait **+25 points** à une entreprise
sans fonds propres ni CAF, parce que `gearing ?? 0` donnait `0 ≤ 100` (+15) et
`dettes/CAF ?? 0` donnait `0 ≤ 3,5` (+10).

**Règle** : un indicateur non calculable vaut `null`, porte un motif, et l'interface écrit
ce motif. Jamais 0, jamais une case vide.

⚠️ **Tout `?? 0` ou `|| 0` ajouté sur un indicateur pour faire compiler est un échec.**
C'est exactement comme ça que le bug est revenu : le helper nommé a été supprimé, puis le
motif a été inliné ailleurs.

---

## 5. État vérifié — build, lint, tests

### Les 10 produits des 3 lots + CreditManagement (typecheck réel)

| App | Dossier | Sous-domaine | Prix | Port | Tests |
|---|---|---|---|---|---|
| Cuisine | `cuisine` | cuisine.yitte.net | 49 €/m | 3027 | 2 |
| Property (Diaspora) | `Property` | property.yitte.net | 59-79 €/m | 3028 | 1 |
| Transit + Calculateur TEC | `transit` | transit.yitte.net | 59 €/m | 3029 | 2 |
| Gardiennage | `gardiennage` | garde.yitte.net | 49-149 €/m | 3024 | 5 |
| Groupage | `groupage` | groupage.yitte.net | 39 €/m | 3025 | 3 |
| ImportAuto | `importauto` | auto.yitte.net | 49 €/m | 3026 | 4 |
| Officine | `officine` | officine.yitte.net | 59 €/m | 3021 | 13 |
| Cabinet | `cabinet` | cabinet.yitte.net | 49 €/m | 3022 | 7 |
| Campus | `campus` | campus.yitte.net | 25-49 €/m | 3023 | 9 |
| RHFlow + add-on Santé | `RHFlow` | rhflow.yitte.net | 59-119 €/m | 5173 | 5 |
| CreditManagement | `CreditManagement` | — | — | — | 43 |
| FinAnalyse | `FinAnalyse` | finanalyse.yitte.net | 49 €/m | — | 12 |
| FinProject | `FinProject` | finproject.yitte.net | 499 € | — | 4 |

Yittenet : port 3030 (+ 3040 pour une seconde instance, voir §7). Tous verts au 08/08/2026.

### ⚠️ MàJ — 4 apps sans typecheck (et non plus 5)

`SupplyChain`, `Audit`, `Concierge`, `Resto` ont `"build": "vite build"` sans `tsc`. Vite
transpile sans vérifier les types. **Toujours lancer `npx tsc --noEmit` séparément sur ces
quatre.**

**Yittenet sort de cette liste** : depuis la suppression de `SaasCatalog.tsx` et
`SaasProductCard.tsx`, il ne reste plus aucun fichier TypeScript dans `src/` hormis
`vite-env.d.ts` (déclaration pure). L'application est 100 % JS/JSX — il n'y a plus rien à
typechecker. Outillage réel : `npm run lint` (oxlint) + `npm run build` (vite).

État au 08/08/2026 : lint **0 erreur**, 10 warnings tous préexistants
(`exhaustive-deps`, `only-export-components`) ; build OK en ~770 ms, 616 kB / 172 kB gzip,
avec l'avertissement de taille de chunk préexistant.

### Archivés (ARCHIVE.md à la racine, code intact)

`ResumeScanner`, `RoastMySaaS`, `ChatbotEmbed` (gratuit concurrent) · `KPI` (cross-app rendu
impossible par la décentralisation) · `Flotte`, `Chantier` (**faux zéro documenté non
corrigé**) · `Project`, `Deal` · `Agenda` (**à réexaminer** — plus proche de Planity que de
Calendly, erreur d'analyse initiale corrigée).

`projectfi` supprimé (doublon de FinProject, même nom de paquet).

---

## 6. Faits vérifiés — ne pas recalculer

### Fiscalité TEC CEDEAO
Source : `C:\Users\hp\Documents\transit\GTM\01-fiscalite-verifiee.md`

- 5 bandes : 0 / 5 / 10 / 20 / 35 %. Nomenclature SH 2022, 6 381 lignes. **Aucune API**,
  diffusion PDF uniquement.
- Sur valeur CAF : Redevance statistique 1 %, PCS (UEMOA) 1 %, PCC (CEDEAO) 0,5 %.
- TVA Sénégal 18 %, assise sur **CAF + tous les droits et taxes hors TVA**.
- **Contrôle** : CAF 100, bande 20 % → **44,55 %** de droits et taxes. C'est un test unitaire.
- **NON vérifié** : le taux de 44,48 % qui circule (la formule donne 44,55) · le COSEC ·
  la table sénégalaise n'affiche que 4 bandes sur 5 (ancien TEC UEMOA) · réforme TVA 9 % en
  Côte d'Ivoire.

### Parité XOF / EUR
**1 EUR = 655,957 XOF est une parité FIXE et STATUTAIRE**, pas un taux de marché. La coder
en dur est correct. La règle « taux saisi à la main et daté » ne vise que les devises
flottantes. **Ne pas « corriger » Property sur ce point.**

---

## 7. Pièges techniques connus

- **Yittenet n'a PAS Tailwind** : ni dépendance, ni CDN, ni config. Variables CSS
  (`--primary`, `--bg-card`, `--text-main`, `--text-muted`, `--border-color`, `--bg-color`,
  `--status-success`, `--domain-genai`…) et classes `.container`, `.card`, `.btn`,
  `.btn-primary`, `.btn-outline`, `.badge` de `src/index.css`. Une page en classes Tailwind
  s'y afficherait **entièrement non stylée**. C'est exactement ce dont souffrait
  `SaasCatalog.tsx`.
- **Yittenet est 100 % JS/JSX.** Ne pas y réintroduire de `.tsx` : il n'y a ni `tsc` dans le
  build, ni tsconfig applicatif. Un fichier TypeScript y passe le build sans être vérifié.
- **`--reporter=basic` n'existe plus en vitest 4** : la commande échoue au démarrage.
- **MàJ — `SaasCatalog.tsx` et `SaasProductCard.tsx` ont été supprimés** le 08/08/2026
  (TypeScript + Tailwind + import cassé vers `lib/supabaseClient`, jamais routés). Leur
  logique de vente a été **réécrite** en `src/pages/Solutions.jsx` — voir §2 et §8 : le code
  mort n'a pas été réactivé, il a été remplacé.
- **MàJ — ports Yittenet** : 3030 (`yittenet`) et 3040 (`yittenet-solutions`, ajouté dans
  `C:\Users\hp\.claude\launch.json` pour faire tourner deux sessions en parallèle sur le
  même dossier). Deux sessions Claude travaillent parfois simultanément sur Yittenet :
  **vérifier `git status` avant tout commit**, des fichiers modifiés peuvent ne pas être les
  vôtres.
- Lots 1 et 2 : `App.tsx` monolithique. Lot 3 : découpage `pages/` + `lib/` + `ui/` +
  `styles.ts`, avec lazy loading. Deux architectures coexistent.

---

## 8. Chantiers ouverts

### ⚠️ Doublon /logiciels vs /solutions — À TRANCHER (MàJ, précisé)

Les deux pages sont **actives et toutes deux dans le Navbar, côte à côte** :
« Nos Logiciels » → `/logiciels`, « Solutions » → `/solutions`.

| | `/logiciels` (`LogicielsSaaS.jsx`) | `/solutions` (`Solutions.jsx`) |
|---|---|---|
| Produits | 13 | 6 |
| Positionnement | métiers ouest-africains, terrain | SaaS B2B France |
| Statut affiché | tous en « Bientôt », boutons inactifs | actifs, liens vers sous-domaines |
| Paiement | aucun (vitrine pure, conforme §2) | **caisse Stripe** (enfreint §2) |
| Ton | douleur métier + cible | tagline + description courte |

**3 produits sont dans les deux** : FinAnalyse, FinProject, Audit — avec des prix
formulés différemment (« à partir de 49 €/mois » vs « 49 €/mois »). Un visiteur qui suit les
deux liens du menu voit deux catalogues concurrents de la même maison.

Les 3 autres de `/solutions` (Logistique, Resto, Conciergerie) n'existent nulle part
ailleurs dans la vitrine.

**Décision à prendre** : une seule page survit. Si c'est `/logiciels` (position conforme à
§2), supprimer `Solutions.jsx`, la route, le lien Navbar et la function — et y ajouter les 3
produits manquants. Si c'est `/solutions`, il faut assumer le changement de règle du §2.

### ⚠️ MàJ — `create-saas-checkout` : pas d'auth, price_id fourni par le client

`supabase/functions/create-saas-checkout/index.ts` (créée, **non déployée**) ne vérifie
aucune session utilisateur et accepte le `priceId` envoyé par le navigateur. Seul le préfixe
`price_` est validé.

Conséquence : n'importe qui peut ouvrir une caisse sur **n'importe quel prix du compte
Stripe de Yittenet** — y compris le prix Premium freelance à 49 €, ce qui contourne le
contrôle « rôle freelancer » de `create-subscription-checkout`.

Correctif si la page est conservée : allowlist des 6 price_id côté function via un secret.
**Ne pas déployer avant.**

### MàJ — état de livraison de /solutions

Fait : page JSX conforme au style maison, route `/solutions`, lien Navbar (icône
`Sparkles`), Edge Function, 6 variables `VITE_STRIPE_PRICE_*` documentées dans
`.env.local.example`. Vérifié en navigateur : rendu correct, 0 erreur console, gating par
variable d'environnement fonctionnel (sans price_id, seul « Découvrir » s'affiche).

Reste à faire **si et seulement si** la page est conservée :
- `supabase functions deploy create-saas-checkout` (secrets `STRIPE_SECRET_KEY`, `SITE_URL`
  déjà en place) ;
- créer 6 prix Stripe — 5 récurrents (49 / 79 / 99 / 49 / 149 €/mois) et **1 one-shot**
  (FinProject 499 €, la function gère le mode `payment`) ;
- reporter les 6 price_id en variables Vercel.

### Boutique — prompt écrit, pas exécuté

Loger dans `/marketplace` (catégories existantes `web3` / `genai`) : les 3 contrats
MedLease en `web3`, ChatbotEmbed et ResumeScanner en `genai`. Produits maison en tableau
**local** (`src/data/produitsMaison.js`, **toujours pas créé — vérifié le 08/08/2026**),
fusionnés avec Supabase, pour ne pas dépendre de la base. La carte affiche
`Créé par {profiles?.full_name}` → doit dire « Par YITTE » pour les produits maison.

### Vérification manuelle restante sur FinAnalyse

Charger un jeu à CAF nulle et confirmer **aux quatre endroits** : écran, export CSV, PDF, et
que le score de santé n'a pas gagné de points.

### Défauts mineurs ouverts

- Scanner QR de Gardiennage : interface `html5-qrcode` en anglais avec marque tierce
  (« Powered by ScanApp ») dans une app française destinée à la vente.
- Sous-domaine d'Audit : trois noms coexistent (`audit.yitte.net`, `auditdirect.yitte.net`,
  paquet `auditflow`, dossier `Audit`) — et `/solutions` en ajoute un quatrième usage.
- Collisions de ports hors lots : 24 apps sur 5173, 7 sur 3000.

---

## 9. MedLease — projet crypto séparé

`C:\Users\hp\MedLease_Production` — token BEP-20, presale et staking **déployés sur BSC**,
presale ouverte (juin → octobre 2026). 4 rapports d'audit (Coinsult, Spywolf), KYC vérifié,
certificat de géoblocage.

**Code de bonne qualité** : offre fixe sans mint, pas de frais ni de pause ni de blacklist,
gardes anti-rug sur les fonctions de secours, CEI strict, rejet des tokens fee-on-transfer.

**Risques nommés** : le « RWA » dans la communication rapproche le token d'un instrument
financier (MiFID II) plutôt que d'un crypto-actif (MiCA) — régime bien plus lourd. Le
staking est la brique la plus requalifiable. Le géoblocage doit être effectif, pas
déclaratif.

**Trou** : aucun des trois contrats ne crée ni ne verrouille de liquidité. Sans paire DEX
avec LP verrouillée, les acheteurs ne peuvent pas sortir.

**Projet de revente en templates** : token 500 €, staking 500 €, presale 750 €, pack 1 500 €.
Paliers : code seul 1 500 € / + déploiement et vérification BscScan 2 300 € / clé en main
3 800 €. Formulation obligatoire — « logique identique à celle auditée, diff vérifiable,
votre déploiement exige son propre audit ». **Interdit** d'écrire « contrats audités » sans
qualification.

---

## 10. Priorités

0. **MàJ — trancher `/logiciels` vs `/solutions` avant tout déploiement de Yittenet.**
   Cinq minutes de décision. Tant que ce n'est pas fait, le menu propose deux catalogues
   concurrents et une caisse non sécurisée attend d'être poussée.
1. **Déployer le calculateur TEC** (`transit.yitte.net/calculateur`). Deux heures, aucune
   donnée terrain requise, et le référencement met des mois à démarrer — chaque semaine
   d'attente est perdue définitivement.
2. **Déployer Property** avec page de vente et paiement. C'est le seul produit dont le
   client est joignable en ligne depuis la France (diaspora, paiement en euros).
3. **Chercher cinq paiements réels.** Pas cinq inscrits sur une liste.
4. Basculer les produits déployés de `'bientot'` à `'en_ligne'` dans `LogicielsSaaS.jsx` —
   un mot par produit.

**Ne construire aucun nouveau produit.** Le problème n'est pas qu'il manque un produit, il
manque un client.

---

## 11. Attentes de travail

- Réponses **concises**, bullet points, avis tranché. Pas de prose développée sur les
  questions stratégiques.
- Le contenu d'un prompt demandé est donné **en texte brut dans le chat**, pas seulement en
  fichier.
- Nommer les risques réglementaires clairement, puis **continuer à explorer** — pas de
  blocage réflexe.
- **Lire le code avant de juger.** Trois erreurs commises faute de l'avoir fait :
  le scan caméra de Gardiennage jugé absent alors qu'il existe (`html5-qrcode`),
  CreditManagement classé « brique » alors que c'est un vrai outil de credit management,
  Agenda balayé comme un clone de Calendly alors qu'il gère prestations tarifées et fichier
  client. **Le poids du code ne dit rien** : Deal fait 12 Ko et est vide, le moteur de
  FinProject fait 12 Ko et est excellent.
- **MàJ — signaler quand une tâche demandée contredit une règle d'architecture du §2.**
  Livrer quand même, mais l'écrire. C'est ce qui s'est passé avec `/solutions` : la tâche
  était claire, la règle aussi, et les deux sont incompatibles.
