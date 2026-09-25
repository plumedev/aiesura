# Tâches d'implémentation (AES-44)

- [x] **Phase 1 : Correctif Backend & Generation steps (`POST /api/monthly-checklists`)**
  - [x] Assainir `stepSchema` dans `server/api/monthly-checklists/index.post.ts` pour accepter les UUID optionnels/nullables ou sécuriser la transmission.
  - [x] Garantir le typage strict des identifiants dans `app/composables/useFlowPlanner.ts`.

- [x] **Phase 2 : Rendu Dynamique du Schéma Visuel (`FlowDiagram.vue`)**
  - [x] Développer la logique de fallback sur `rules` lorsque `steps` est vide.
  - [x] Vérifier que le diagramme réagit en temps réel à l'ajout/modification d'une règle et au recalcul du plan.

- [x] **Phase 3 : Consultation Détaillée des Dépenses dans les Règles (`RulesList.vue`)**
  - [x] Supprimer la classe `truncate` sur l'affichage des itérations récurrentes.
  - [x] Implémenter l'affichage multi-lignes/badges de chaque dépense incluse dans une règle.

- [x] **Phase 4 : Validation & Assurance Qualité**
  - [x] Exécuter `npm run lint`
  - [x] Exécuter `npm run typecheck`
