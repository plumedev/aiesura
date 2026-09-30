# AES-58: Déplacement du sélecteur de période classique dans le header de la vue d'ensemble

## Contexte & Objectifs
Optimiser l'ergonomie et l'espace vertical disponible sur la page Vue d'ensemble (`/dashboard`) en mode Desktop.
Le sélecteur de période analysée sous sa forme compacte ("classique", `OverviewDateRangePicker`) est déplacé dans l'en-tête de page (`UDashboardNavbar`), libérant ainsi de l'espace au-dessus des cartes KPI et du tableau des flux.
La version "Slider" (`OwlDatePicker`), nécessitant une pleine largeur pour une manipulation confortable au curseur, reste positionnée dans le corps de la page lorsque ce mode est activé.

---

## Spécifications Fonctionnelles & Interface Utilisateur

### 1. En-tête de page (`UDashboardNavbar` dans `app/pages/dashboard/index.vue`)
- Positionnement du sélecteur classique au centre de la barre (`slot default` de `UDashboardNavbar`) :
  - Conditionné par `v-if="!useOwlDatePicker"`.
  - Centré élégamment entre le titre de gauche et les boutons d'actions de droite.
  - Masqué sur écran mobile/tablette compacte (`hidden md:inline-flex`) car la sélection de période sur mobile est déjà dédiée au Bottom Sheet.
  - Encapsulé dans `<ClientOnly>` pour prévenir les disparités SSR / hydratation client.
  - Composant : `<OverviewDateRangePicker :model-value="dateRange" @update:model-value="updateDateRange" />`.

### 2. Corps de page (`app/pages/dashboard/index.vue`)
- Le bloc desktop `<!-- Sélecteur de période (Desktop) -->` est désormais conditionné par `v-if="useOwlDatePicker"`.
- En mode classique (`!useOwlDatePicker`), le bloc disparaît totalement du corps de page, permettant aux KPI et à la liste des transactions de remonter naturellement.
- En mode slider (`useOwlDatePicker`), le slider `OwlDatePicker` reste affiché sur toute la largeur comme auparavant.

### 3. Responsive & Mobile
- Aucun impact sur la vue mobile : le Bottom Sheet continue de proposer le choix entre les deux sélecteurs.

---

## Plan d'Action

- [x] **Étape 1 :** Intégrer `OverviewDateRangePicker` dans `<template #right>` de `UDashboardNavbar` dans `app/pages/dashboard/index.vue`.
- [x] **Étape 2 :** Ajouter `v-if="useOwlDatePicker"` sur le bloc desktop du corps de page et retirer le `v-else` devenu inutile dans le corps.
- [x] **Étape 3 :** Exécuter automatiquement `npm run lint` et `npm run typecheck` pour garantir la conformité du code.
- [x] **Étape 4 :** Exécuter la suite de tests `npm run alltest` pour valider la non-régression.
