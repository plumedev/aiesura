# Décisions de Design (Architecture & Données)

Le pivot vers un "Orchestrateur de Virements" change profondément le modèle de données.

## 1. Modèle de Données (Drizzle ORM)
Nous aurons besoin des entités suivantes, toujours rattachées au `user_id` (Supabase) :

- **`accounts`** : Les nœuds du système (comptes en banque, cartes, pockets).
  - Champs : `id`, `user_id`, `name`, `icon`, `color`.
- **`monthly_flows`** : Les entrées/sorties fixes depuis l'extérieur vers le système.
  - Champs : `id`, `user_id`, `account_id` (Compte impacté), `type` (income/expense), `amount`, `name`.
- **`transfer_rules`** : Les règles de routage interne.
  - Champs : `id`, `user_id`, `source_account_id`, `destination_account_id`, `amount` (montant fixe, peut être null si le montant est dynamique), `purpose_name` (ex: "Virement Abonnements").
- **`transfer_rule_flows` (Table de liaison)** : Permet d'associer un ou plusieurs `monthly_flows` à une règle de virement. 
  - Champs : `transfer_rule_id`, `monthly_flow_id`. (ex: La règle "Virement Abonnements" est liée aux flux "Netflix" et "Spotify"). Le moteur fera la somme pour générer le virement.

## 2. Logique de Génération du Plan (Le Moteur)
Lorsque l'utilisateur consulte son mois :
1. Le système calcule le solde prévisionnel du Compte Principal (Revenus fixes - Charges fixes).
2. Le système lit toutes les `transfer_rules`.
3. Il génère une liste d'opérations (la "Cascade").
4. *Bonus futur* : Il peut alerter si une règle demande de transférer plus d'argent qu'il n'en reste sur le compte source.

## 3. UI / UX
- **Vue Architecture** : Une interface claire pour lister ses comptes et y attacher les revenus/charges.
- **Vue Routage (Rules)** : Un éditeur de règles pour définir les budgets (Source -> Destination : Montant).
- **Vue Exécution (Dashboard)** : Une To-Do List interactive avec des cases à cocher persistantes pour le mois en cours (`month_executions`), afin de suivre quels virements ont déjà été faits.
