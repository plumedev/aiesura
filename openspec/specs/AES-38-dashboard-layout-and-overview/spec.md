# [AES-38] Mise en place du Layout Dashboard et Vue d'ensemble

## Contexte
L'application nécessite une interface de type "Dashboard" pour permettre aux utilisateurs de visualiser l'état de leurs finances et de naviguer entre les différentes sections (Comptes, Flux, Règles, Paramètres).

## Architecture Technique
- **Inspiration & Utilisation :** Nous nous baserons directement sur l'architecture et les composants de [nuxt-ui-templates/dashboard](https://github.com/nuxt-ui-templates/dashboard).
- **Adaptation :** Puisque les composants `@nuxt/ui-pro` sont désormais 100% gratuits et intégrés, nous utiliserons directement les composants officiels (ex: `UDashboardLayout`, `UDashboardSidebar`) sans avoir à les recréer de zéro.
- **Gestion d'état :** Un `useState` global gérera l'état d'ouverture/fermeture de la Sidebar sur mobile.

## Pages et Composants

### 1. Vue d'ensemble (`pages/dashboard/index.vue`)
- **Header :** Titre "Tableau de Bord" et sélecteur de période.
- **KPIs :** Solde Total, Revenus du mois, Dépenses du mois.
- **Graphique Principal :** Évolution temporelle (mocké pour le moment).
- **Derniers Mouvements :** Liste des transactions/flux récents.
- **Quick Actions :** Boutons pour des actions rapides.

### 2. Gestion des Comptes (`pages/dashboard/accounts.vue`)
- Intégration de la page existante dans le nouveau Layout.
- Tableau listant les comptes bancaires.
- Actions : Modifier, Supprimer, Définir comme principal.

### 3. Flux Mensuels (`pages/dashboard/flows.vue`)
- Tableau de gestion détaillé des revenus et dépenses récurrents.
- Formulaire d'ajout de flux (Type, Montant, Nom, Fréquence, Jour d'exécution).
- Activation/Désactivation d'un flux.

### 4. Règles de Virements (`pages/dashboard/rules.vue`)
- **Schéma Visuel (Flow Map) :** Représentation graphique type diagramme de nœuds/Sankey montrant les flux d'argent entre les comptes.
- **Routage de l'argent :** Compte Source -> Compte de Transit (Optionnel) -> Compte Cible.
- Configuration de l'objectif et du montant.

### 5. Paramètres (`pages/dashboard/settings.vue`)
- Gestion du profil utilisateur (Nom, Email).
- Préférences globales (Thème Clair/Sombre).

## Règles d'Acceptation
- Le layout s'applique à toutes les routes enfants de `/dashboard`.
- Le menu Sidebar est "responsive" (se rétracte sur mobile).
- La navigation fonctionne de manière fluide (SPA / `vue-router`).
