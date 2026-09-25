# AES-47 — Landing page produit avec showcase interactif et mini-démos

**Ticket Linear :** AES-47
**Statut :** In Progress
**Branche Git :** `feat/landing-page-showcase`
**Rédigé le :** 2026-09-19

---

## 1. Contexte & Objectif

Actuellement, la route racine (`/`) de l'application affiche le gabarit par défaut du starter Nuxt UI.
L'objectif de cette spécification est de concevoir et d'implémenter la **véritable landing page d'Aiesura**, une vitrine produit moderne, fluide et immersive qui illustre la valeur ajoutée unique de l'application :

1. **La clarté budgétaire par itération :** Comprendre ses flux futurs sans rigidité.
2. **Le moteur de répartition automatisé (Flows) :** Répartir automatiquement ses revenus vers ses comptes d'épargne et projets selon des règles personnalisées.
3. **La Checklist mensuelle des virements :** Une to-do list concrète et déstressante pour exécuter ses transferts le 1er du mois en toute sérénité.

Pour maximiser l'engagement des visiteurs, la landing page intègre une **double approche interactive** :
- Un **Hero Showcase interactif** multi-onglets permettant d'explorer l'application immédiatement.
- Des **mini-démos ciblées** au sein des sections de présentation de fonctionnalités (simulateur de flux avec curseur de salaire, itérations éditables, checklist avec progression en temps réel).

---

## 2. Décisions de Design & Conventions

| # | Sujet | Décision |
|---|-------|----------|
| **D1** | Architecture des composants | Création d'un dossier dédié `app/components/landing/` regroupant les composants modulaires : `LandingHeroShowcase.vue`, `LandingOverviewDemo.vue`, `LandingFlowDemo.vue`, `LandingChecklistDemo.vue`, `LandingFeatures.vue`, `LandingFaq.vue`, `LandingCta.vue`. |
| **D2** | Respect du Design System (`design.md`) | Respect strict des tokens : conteneurs en `#F1F5F3` (Light) et `#0C3C32` (Dark), couleur d'accent vert forêt `#0A332C`, bordures subtiles (`border-black/10` / `border-white/10`), effets de verre dépoli (*glass-panel*). |
| **D3** | Showcase Hero multi-onglets | Tableau de bord factice et élégant avec navigation par onglets : *1. Vue d'ensemble*, *2. Diagramme de flux*, *3. Checklist mensuelle*. Le visiteur interagit sans nécessiter de compte. |
| **D4** | Mini-démo 1 — Vue d'ensemble & Itérations | Présentation des KPIs (Revenus, Dépenses, Solde prévisionnel) + liste d'itérations interactives avec badge de statut (récurrent, ponctuel) et bouton de simulation d'ajustement. |
| **D5** | Mini-démo 2 — Planificateur de flux (Flow Planner) | Démo avec curseur interactif de salaire (ex: 2 000 € à 5 000 €) montrant en temps réel la ventilation automatique vers le Compte Courant, le Livret A, le Compte Projets et l'Investissement selon les règles définies (% et fixes). |
| **D6** | Mini-démo 3 — Checklist mensuelle | Bloc to-do list interactif avec cases à cocher dynamiques et jauge de progression circulaire / barre animée indiquant le statut d'avancement des virements du mois. |
| **D7** | Navigation & Header public | Header responsive avec logo Aiesura, liens d'ancrage (`#fonctionnalites`, `#demo`, `#flux`, `#securite`), sélecteur de mode clair/sombre, bouton "Se connecter" et CTA d'inscription "Démarrer gratuitement". |
| **D8** | Performance & SEO | Métadonnées Open Graph / Twitter Card optimisées, balisage sémantique (`h1`, `h2`, `section`), animations CSS natives légères, chargement sans latence. |

---

## 3. Spécification Détaillée de la Page (`app/pages/index.vue`)

### 3.1 Structure de la Page

```
┌────────────────────────────────────────────────────────────────────────┐
│ Header : Logo Aiesura | Liens (Fonctionnalités, Démo, Sécurité) | Auth │
├────────────────────────────────────────────────────────────────────────┤
│ Hero Section :                                                         │
│   - Titre fort : "La gestion financière personnelle, claire et fluide" │
│   - Sous-titre rassurant sur l'automatisation et l'épargne             │
│   - CTA "Créer un compte gratuit" + "Voir la démo interactive"         │
│   - Showcase Interactif (Onglets : Vue d'ensemble, Flux, Checklist)    │
├────────────────────────────────────────────────────────────────────────┤
│ Section 1 : "Trois piliers pour reprendre le contrôle"                 │
│   - 3 cartes d'avantages majeurs avec icônes et micro-interactions     │
├────────────────────────────────────────────────────────────────────────┤
│ Section 2 (Démo) : "Visualisez et anticipez sans contrainte"           │
│   - Mini-démo de la Vue d'ensemble avec itérations modifiables         │
├────────────────────────────────────────────────────────────────────────┤
│ Section 3 (Démo) : "Automatisez la répartition de vos revenus"         │
│   - Simulateur interactif de flux avec curseur de salaire dynamique    │
├────────────────────────────────────────────────────────────────────────┤
│ Section 4 (Démo) : "Exécutez vos virements mensuels sans stress"       │
│   - Mini-démo de la Checklist avec cases cochables et jauge en direct  │
├────────────────────────────────────────────────────────────────────────┤
│ Section 5 : "Sécurité & Confidentialité par conception"                │
│   - Chiffrement Supabase, isolation stricte des données, pas de pub    │
├────────────────────────────────────────────────────────────────────────┤
│ Section 6 : Call to Action Final & Footer enrichi                      │
│   - Bannière engageante avec création de compte en 1 minute            │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Composants Modulaires (`app/components/landing/`)

1. **`LandingHeroShowcase.vue`** :
   - Conteneur avec barre de fenêtre style macOS/browser (points rouge, jaune, vert).
   - Onglets Nuxt UI (`UTabs`) pour basculer entre :
     - *Vue d'ensemble* (KPIs + transactions récentes).
     - *Flux financiers* (visualisation des règles de répartition).
     - *Checklist mensuelle* (virements prêts à être validés).
   - Fond verre dépoli conforme au design system (`glass-panel`).

2. **`LandingOverviewDemo.vue`** :
   - Reproduction stylisée et mockée du dashboard.
   - Sélecteur de mois interactif (changement du mois affiché).
   - 3 cartes KPI (Revenus, Dépenses, Solde net calculé).
   - Table d'itérations réalistes avec toggle d'ajustement direct.

3. **`LandingFlowDemo.vue`** :
   - Curseur (`URange` ou input numérique) permettant de faire varier le revenu net (ex: 3 200 €).
   - Calcul en temps réel des règles :
     - Charges fixes (Dépenses contraintes) : 1 400 €
     - Épargne de précaution (Livret A) : 20%
     - Projets vacances : 150 € fixe
     - Reste à vivre (Plaisirs & quotidien) : solde restant calculé
   - Affichage visuel des flux avec badges colorés et montants calculés.

4. **`LandingChecklistDemo.vue`** :
   - Liste des 3 virements types du 1er du mois (ex: "Transit vers Compte Courant", "Virement vers Livret A", "Alimentation Compte Projets").
   - Cases à cocher interactives avec son visuel (barrement, badge "Effectué").
   - Barre de progression dynamique (0% → 33% → 66% → 100%).

5. **`LandingFeatures.vue`** :
   - Grille de 3 à 6 cartes détaillant les fonctionnalités différenciatrices (multi-comptes, gestion des fréquences, alertes visuelles, mode sombre natif).

6. **`LandingCta.vue`** :
   - Bannière de conversion avec boutons d'accès direct vers `/register` et `/login`.

---

## 4. Scénarios de Test & Critères d'Acceptation (Gherkin)

```gherkin
Scénario: Découverte de la landing page et interaction avec le Hero Showcase
  Étant donné un visiteur non authentifié arrivant sur "/"
  Quand la page est chargée
  Alors le titre principal, les CTA et le showcase interactif sont visibles
  Et le visiteur peut cliquer sur l'onglet "Flux" pour afficher la simulation de répartition
  Et le visiteur peut cliquer sur l'onglet "Checklist" pour prévisualiser la to-do list mensuelle

Scénario: Utilisation du simulateur de flux dynamique
  Étant donné le visiteur observant la section "Automatisation des flux"
  Quand il ajuste le curseur de revenu mensuel de 3 000 € à 4 000 €
  Alors les montants alloués aux comptes épargne et projets se recalculent instantanément en temps réel

Scénario: Interaction avec la checklist mensuelle interactive
  Étant donné le visiteur observant la section "Checklist mensuelle"
  Quand il clique sur une case à cocher pour marquer un virement comme effectué
  Alors la jauge de progression augmente et l'étape est marquée d'un badge de validation vert

Scénario: Cohérence du thème et du Design System
  Étant donné le visiteur changeant le mode clair/sombre via le bouton de thème
  Alors les conteneurs adoptent les fonds respectifs #F1F5F3 (clair) et #0C3C32 (sombre)
  Et la lisibilité du texte et les contrastes sont parfaitement conservés
```

---

## 5. Plan d'Action & Étapes d'Exécution

1. **Création des composants interactifs de la landing :**
   - `app/components/landing/LandingHeroShowcase.vue`
   - `app/components/landing/LandingOverviewDemo.vue`
   - `app/components/landing/LandingFlowDemo.vue`
   - `app/components/landing/LandingChecklistDemo.vue`
   - `app/components/landing/LandingFeatures.vue`
   - `app/components/landing/LandingCta.vue`
2. **Assemblage de la landing page principale :**
   - Remplacement du starter template dans `app/pages/index.vue`.
   - Ajout des balises SEO (meta tags, descriptions précises).
3. **Harmonisation du layout public (`app/layouts/default.vue`) :**
   - Enrichissement du header avec liens d'ancrage et navigation rapide.
   - Footer complet avec mentions du produit.
4. **Vérification qualité & validation :**
   - Exécution conjointe de `npm run lint` et `npm run typecheck`.
   - Vérification de l'expérience sur navigateur (desktop et mobile).
