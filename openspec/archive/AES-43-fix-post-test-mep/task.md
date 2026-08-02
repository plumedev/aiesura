# Plan d'Action & Tâches (AES-43)

- [x] **Lisibilité & Glassmorphism (Modales & Notifications)**
  - [x] Fixer la classe `.glass-panel` dans `main.css` pour les modales et cartes à fond solide (`#F1F5F3` / `#0C3C32`).
  - [x] Atténuer le flou de l'overlay des modales (`modal.overlay` : `backdrop-blur-[2.5px]`).
  - [x] Créer la classe `.toast-glass` (`rgba(241, 245, 243, 0.40)` / `rgba(12, 60, 50, 0.45)` + `backdrop-filter: blur(14px)`).
  - [x] Assigner `.toast-glass` au slot `toast.root` dans `app.config.ts`.

- [x] **Champ "Date de fin" dans l'Onboarding**
  - [x] Ajouter `hasEndDate` et `endDate` aux réactifs `incomeForm` et `expenseForm` dans `onboarding.vue`.
  - [x] Intégrer les contrôles (toggle + champ date) dans les formulaires de l'Étape 2 (Revenus) et Étape 3 (Dépenses).
  - [x] Transmettre `endDate` sous forme ISO lors de l'appel `/api/transactions`.

- [x] **Indication dynamique d'itérations (`TransactionForm.vue`)**
  - [x] Créer la propriété calculée `occurrenceCount` dans `TransactionForm.vue`.
  - [x] Afficher l'indicateur d'information sous le sélecteur de plage lorsque la date de fin est active.

- [x] **Placeholders obligatoires**
  - [x] Ajouter `placeholder="Ex: 50.00"` au champ montant dans `TransactionForm.vue`.
  - [x] Inscrire la règle permanente dans `.agents/AGENTS.md`.

- [x] **Stepper & Scrollbars**
  - [x] Fixer la forme circulaire des ronds d'étapes (`shrink-0 aspect-square`).
  - [x] Styliser les scrollbars globales (Webkit & Firefox) aux couleurs des thèmes clair et sombre.

- [x] **Documentation & Assurance Qualité**
  - [x] Mettre à jour `openspec/design.md`.
  - [x] Synchroniser `spec.md` (`/opsx:sync-spec`).
  - [x] Archiver dans `openspec/archive/AES-43-fix-post-test-mep/` (`/opsx:archive`).
  - [x] Valider `npm run lint` et `npm run typecheck`.
