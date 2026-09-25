# AES-37: Implémenter la page Transactions

## Contexte
La page des transactions (historique des opérations) permet à l'utilisateur de visualiser et de saisir manuellement ses dépenses et revenus ponctuels. Actuellement, la base de données contient la table `monthly_flows` dédiée aux règles de flux réguliers, mais il manque une table pour enregistrer l'historique réel des transactions ponctuelles.

## Objectifs
- Mettre à jour le schéma de base de données pour inclure une table `transactions`.
- Afficher un tableau (`UTable`) listant toutes les transactions.
- Créer un formulaire d'ajout/édition dans un `USlideover` (panneau latéral) ou `UModal`.
- Filtrer les transactions par compte.

## Architecture de la base de données
Création d'une **nouvelle** table `transactions` dans `server/database/schema.ts` (la table `monthly_flows` existante sera réservée aux règles de virement plus tard).
- `id` (uuid, primary key)
- `userId` (uuid, foreign key vers `profiles.id`)
- `accountId` (uuid, foreign key vers `accounts.id`)
- `type` (text : `income` | `expense`)
- `amount` (numeric, précision 10, scale 2)
- `name` (text, libellé de l'opération)
- `frequency` (text : `once` | `monthly` | `quarterly` | `yearly`)
- `startDate` (timestamp, date de début ou date de la transaction unique)
- `endDate` (timestamp, nullable, si une date de fin est précisée)
- `createdAt` (timestamp, date d'insertion)

## Architecture UI (Nuxt UI)
- **`pages/dashboard/transactions.vue`** : 
  - Conteneur `UDashboardPage` et `UDashboardPanel`.
  - `UDashboardNavbar` avec le titre et un bouton "Ajouter une transaction".
- **Filtres et Tableau de données** : 
  - Une barre de recherche (`UInput`) pour chercher par nom de transaction.
  - Un tableau `UTable` avec colonnes triables (`sortable: true`) correspondantes au screenshot : Libellé, Date (startDate), Fréquence, Type, Compte, Montant.
  - Possibilité d'ajouter des filtres déroulants (`USelectMenu` ou `UDropdown`) pour Compte, Type, et Fréquence au-dessus du tableau.
- **Formulaire d'ajout (`components/transactions/TransactionForm.vue`)** : 
  - Affiché dans une `UModal` (au lieu du Slideover).
  - Composant `UForm` avec validation de schéma `zod`.
  - Ligne 1 : Nom de la transaction (Input) / Montant (Input number).
  - Ligne 2 : Sélecteur de compte (Select) / Sélecteur de type (Dépense/Revenu).
  - Sélecteur de fréquence (Segmented Control ou Radio: Unique, Mensuel, Trimestriel, Annuel).
  - DatePicker : Plage de dates avec possibilité d'activer/désactiver la Date de fin via un Toggle.

## Plan d'implémentation (Workflow SDD)
1. **Schéma & Base de données** : Ajouter `transactions` dans `schema.ts`, générer et pousser la migration via Drizzle.
2. **Endpoints API** : 
   - Créer `server/api/transactions/index.get.ts` (lecture)
   - Créer `server/api/transactions/index.post.ts` (création)
   - Créer `server/api/transactions/[id].delete.ts` (suppression)
3. **Composants Vue** : Implémenter le formulaire `TransactionForm` et son intégration dans une `UModal`.
4. **Intégration** : Mettre en place la page `transactions.vue` avec les filtres, le tableau et l'état réactif (via `useFetch`).
