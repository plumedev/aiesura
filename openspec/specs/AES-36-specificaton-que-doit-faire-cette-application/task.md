# Plan d'Action (Macro Tasks)

Ces macro-tâches composeront les prochains tickets d'implémentation.

- `[ ]` **Phase 1 : Socle de Données (Data Layer)**
  - Création des tables `accounts`, `monthly_flows`, et `transfer_rules` dans le schéma Drizzle.
  - Génération et migration BDD.
- `[ ]` **Phase 2 : Paramétrage du Système (Settings UI)**
  - CRUD pour les Comptes (`accounts`).
  - CRUD pour assigner des revenus/charges fixes à ces comptes (`monthly_flows`).
- `[ ]` **Phase 3 : Définition des Règles de Routage (Routing UI)**
  - Interface pour créer des `transfer_rules`. 
  - Sélection d'un compte source et d'un compte cible.
  - Sélection du mode de calcul : Montant fixe OU Sélection multiple parmi les `monthly_flows` existants (calcul dynamique de la somme).
- `[ ]` **Phase 4 : L'Orchestrateur du 1er du Mois (Dashboard UI)**
  - Calcul du Reste à vivre sur le compte principal.
  - Affichage de la To-Do list générée (la cascade de virements).
  - Système de cache ou de table temporaire pour mémoriser les cases cochées de la To-Do list du mois en cours.
