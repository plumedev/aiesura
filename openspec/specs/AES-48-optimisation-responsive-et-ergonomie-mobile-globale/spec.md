# AES-48 — Optimisation responsive et ergonomie mobile globale

**Ticket Linear :** AES-48  
**Statut :** In Progress  
**Branche Git :** `main`  
**Rédigé le :** 2026-09-24  

---

## 1. Contexte & Diagnostic Mobile (Pixel 10 Pro / Viewport ~412px)

Un audit complet a été réalisé sur un viewport mobile standard (412x915, format Google Pixel). Plusieurs points de friction et blocages critiques ont été identifiés à travers l'application :

1. **Navigation Dashboard bloquée sur mobile :**
   - `<UDashboardSidebarCollapse />` est masqué sur mobile (`base: hidden lg:flex`).
   - Le bouton hamburger `<UDashboardSidebarToggle />` (`base: lg:hidden`) était absent de toutes les pages du dashboard (`index.vue`, `transactions.vue`, `accounts.vue`, `flows.vue`, `settings.vue`). Les utilisateurs mobiles étaient donc dans l'incapacité d'ouvrir le menu de navigation latéral.
2. **Menu Mobile Public vide (`app/layouts/default.vue`) :**
   - `<UHeader>` n'implémentait pas le slot `#body`. Le clic sur le burger ouvrait un tiroir vide sans les liens d'ancrage ni les boutons de connexion/démarrage.
   - Le nom de marque "Aiesura" était masqué sous 640px (`hidden sm:inline-block`).
3. **Écran d'onboarding inaccessible sur mobile (`app/pages/dashboard/onboarding.vue`) :**
   - Le conteneur parent en `h-screen overflow-hidden` et la colonne gauche du stepper en `h-full` consommaient 100% de la hauteur de l'écran mobile, masquant totalement le formulaire d'action à droite.
4. **Débordement des Navbars Dashboard sur mobile :**
   - Dans `transactions.vue`, les 3 blocs de métriques récurrentes (`Dépenses`, `Revenus`, `Solde`) placés dans `#right` débordent sur 412px et masquent ou compressent le bouton d'ajout.
   - Dans `index.vue`, le sélecteur de date et les boutons d'action de la navbar nécessitent un affichage compact sur petits écrans (icônes seules ou masquage conditionnel).
5. **Tableaux et démos avec défilement horizontal manquant :**
   - `LandingOverviewDemo.vue`, `LandingHeroShowcase.vue`, `transactions.vue`, `accounts.vue` et le tableau d'itérations de `index.vue` nécessitent un conteneur avec `overflow-x-auto` explicite et des largeurs minimales pour garantir la lisibilité des montants, badges et actions sans distorsion.
6. **Pages d'authentification (`login.vue`, `register.vue`, etc.) :**
   - Absence de padding horizontal sur le conteneur plein écran, provoquant un collage direct des cartes de formulaire contre les bords de l'écran sur mobile.

---

## 2. Décisions de Design & Conventions

| # | Sujet | Décision |
|---|-------|----------|
| **D1** | Navigation Dashboard mobile | Ajouter conjointement `<UDashboardSidebarToggle />` et `<UDashboardSidebarCollapse />` dans le slot `#leading` de la navbar de toutes les pages du dashboard. Le burger s'affiche automatiquement sur mobile (`< lg`) et le collapse sur desktop (`>= lg`). |
| **D2** | Menu public (`UHeader`) | Implémenter le slot `#body` dans `default.vue` avec les liens de navigation, le bouton de connexion et le bouton d'inscription pour offrir un menu mobile complet et fluide. Conserver le label "Aiesura" visible à côté du logo. |
| **D3** | Onboarding responsive | Transformer le layout d'onboarding en mode mobile : stepper compact horizontal ou bandeau rétractable en haut (`h-auto`), libérant l'espace pour que les formulaires d'étapes soient pleinement visibles et scrollables. |
| **D4** | Navbars & KPIs Dashboard | Masquer les détails verbeux des statistiques récurrentes dans `transactions.vue` sur mobile (`hidden md:flex`), rendre le bouton "Ajouter" adaptatif (icône seule sur petit écran, texte complet sur écran large). |
| **D5** | Tableaux & Démos interactives | Envelopper tous les tableaux de données dans un conteneur `overflow-x-auto` avec touch-scrolling fluide (`-webkit-overflow-scrolling: touch`) pour éviter tout débordement horizontal du viewport global. |
| **D6** | Pages Auth & Modales | Ajouter `p-4 sm:p-6` sur les conteneurs d'authentification et vérifier que les modales (`AppModal`, etc.) respectent les zones tactiles minimales (44px) et le défilement vertical interne. |

---

## 3. Plan d'Action & Découpage

1. **Phase 1 — Layouts & Navigation globale**
   - Mettre à jour `app/layouts/default.vue` (slot `#body` du menu mobile, logo + titre).
   - Mettre à jour `app/layouts/dashboard.vue` (vérification de la réactivité du drawer).
   - Ajouter `<UDashboardSidebarToggle />` dans les navbars de `index.vue`, `transactions.vue`, `accounts.vue`, `flows.vue`, `settings.vue`.
2. **Phase 2 — Onboarding (`onboarding.vue`)**
   - Adapter le stepper pour qu'il soit compact sur mobile (`md:w-2/5`, `h-auto` sur mobile, conteneur scrollable).
   - Garantir l'accessibilité immédiate des boutons d'action (Suivant, Créer, Passer).
3. **Phase 3 — Dashboard Pages & Tableaux**
   - `transactions.vue` : Navbar responsive (stats en `hidden md:flex`, bouton compact), tableau scrollable.
   - `accounts.vue` : Adaptation de la navbar et du tableau de comptes.
   - `index.vue` : Adaptation du filtre, du sélecteur de date et du tableau d'itérations.
   - `flows.vue` : Grille de sélection de période et diagramme de flux sur 1 colonne sur mobile.
4. **Phase 4 — Landing Page & Mini-Démos**
   - `LandingHeroShowcase.vue` : Sélecteur d'onglets mobile et défilement des tables.
   - `LandingOverviewDemo.vue` : `overflow-x-auto` sur le tableau d'itérations.
   - `LandingFlowDemo.vue` : Contrôleur de salaire et boutons de presets tactiles.
5. **Phase 5 — Auth & Finitions**
   - Padding des pages `/login`, `/register`, `/forgot-password`, `/update-password`.
   - Exécution systématique de `npm run lint` et `npm run typecheck`.
   - Test final dans le navigateur en mode Pixel (412x915).
