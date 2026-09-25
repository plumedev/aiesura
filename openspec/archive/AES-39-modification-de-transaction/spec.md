# AES-39: Modification de transaction

## Contexte
L'utilisateur doit pouvoir modifier une transaction existante depuis l'écran des transactions (`dashboard/transactions.vue`). 
Lorsqu'il clique sur "Éditer" dans le menu contextuel "…", une modale s'ouvre, contenant un formulaire pré-rempli avec les informations actuelles de la transaction.

Plusieurs scénarios doivent être couverts :
- **Transaction unique (fréquence "Unique") :** La mise à jour est directe.
- **Transaction récurrente :** L'utilisateur doit choisir entre appliquer les modifications à **toutes les itérations** ou uniquement aux **prochaines itérations**.

---

## Choix de Conception & Récits Utilisateur (User Stories)

### 1. Édition d'une transaction unique
- L'utilisateur ouvre la modale d'édition.
- Les champs sont pré-remplis avec les valeurs de la transaction.
- Après modification et enregistrement, la transaction mère et son unique itération sont mises à jour en base de données.

### 2. Édition d'une transaction récurrente
- L'utilisateur modifie les informations de la transaction récurrente.
- Au moment d'enregistrer, une modale de confirmation s'ouvre pour lui demander :
  - **Toutes les itérations :** Met à jour la transaction d'origine et régénère toutes les itérations correspondantes (en préservant uniquement celles qui ont été éditées individuellement, c'est-à-dire avec `isModified: true`).
  - **Les prochaines itérations :** Ferme la transaction actuelle à la veille de la nouvelle date d'effet (en définissant son `endDate`), et crée une nouvelle transaction (avec les modifications apportées) à partir de la date d'effet. Les itérations existantes après la date d'effet sont réaffectées à la nouvelle transaction ou recréées.

---

## Modifications Proposées

### 1. Base de données & API

#### [NEW] `server/api/transactions/[id].patch.ts`
Nouvel endpoint de mise à jour des transactions.

- **Schéma de validation Zod :**
  ```ts
  const patchTransactionSchema = z.object({
    accountId: z.string().uuid().optional(),
    type: z.enum(['income', 'expense']).optional(),
    amount: z.number().positive().optional(),
    name: z.string().min(1).optional(),
    frequency: z.enum(['once', 'monthly', 'quarterly', 'yearly']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().nullable().optional(),
    updateMode: z.enum(['single', 'all', 'future']).optional() // 'single' pour unique, 'all' ou 'future' pour récurrentes
  })
  ```

- **Logique d'exécution :**
  1. Récupérer l'utilisateur connecté via `requireUser(event)`.
  2. Valider le body et vérifier que la transaction appartient à l'utilisateur.
  3. **Si `updateMode` est `'single'` ou `'all'` (ou si la transaction n'est pas récurrente) :**
     - Mettre à jour les champs de la transaction mère dans la table `transactions`.
     - Récupérer toutes les itérations déjà marquées comme modifiées (`isModified = true`).
     - Supprimer toutes les itérations non modifiées de cette transaction (`isModified = false`).
     - Générer les nouvelles itérations à l'aide de `generateIterations` sur toute la période.
     - Insérer les nouvelles itérations générées en évitant d'écraser ou de dupliquer aux dates où des itérations modifiées (`isModified = true`) ont été conservées.
  4. **Si `updateMode` est `'future'` :**
     - La date d'effet de la scission est le nouveau `startDate` transmis (ou la date actuelle si non fournie).
     - **Transaction d'origine :** Mettre à jour sa date de fin (`endDate`) à la veille de la date d'effet.
     - **Nouvelle transaction :** Créer une nouvelle ligne dans la table `transactions` avec les caractéristiques modifiées et comme `startDate` la date d'effet.
     - **Réaffectation / Nettoyage des itérations :**
       - Supprimer les itérations non modifiées (`isModified = false`) de la transaction d'origine dont la date d'exécution est supérieure ou égale à la date d'effet.
       - Pour les itérations modifiées individuellement (`isModified = true`) dont la date d'exécution est supérieure ou égale à la date d'effet, mettre à jour leur `transactionId` pour les associer à la nouvelle transaction.
       - Générer et insérer les itérations de la nouvelle transaction à partir de la date d'effet.

### 2. Frontend / Composants Vue

#### [MODIFY] [TransactionForm.vue](file:///c:/Users/lenov/Documents/Side%20projects/Projet%20SDD/app/components/transactions/TransactionForm.vue)
- Ajouter une prop optionnelle `transaction` :
  ```ts
  const props = defineProps<{
    transaction?: any // transaction à éditer
  }>()
  ```
- Si `props.transaction` est présente, pré-remplir l'état réactif `state` à l'initialisation.
- Remplacer le libellé du bouton de soumission par "Enregistrer" en mode édition.
- Gérer l'événement de soumission :
  - Si édition d'une transaction récurrente (fréquence != `'once'`), afficher une modale de confirmation pour le choix du mode (`all` ou `future`).
  - Envoyer le payload approprié à l'API (`PATCH /api/transactions/[id]`).

#### [MODIFY] [transactions.vue](file:///c:/Users/lenov/Documents/Side%20projects/Projet%20SDD/app/pages/dashboard/transactions.vue)
- Ajouter l'état pour la transaction en cours d'édition :
  ```ts
  const editingTransaction = ref<Transaction | null>(null)
  ```
- Associer l'action "Éditer" du menu contextuel au déclenchement de la modale d'édition.
- Intégrer la modale d'édition avec `TransactionForm.vue`.

---

## Plan de Vérification

### Tests Automatisés
- Lancer `npm run typecheck` et `npm run lint` pour s'assurer qu'aucune erreur TypeScript ou de style n'est introduite.
- Exécuter la suite de tests existante (`npm run test:unit` ou `vitest`).

### Validation Manuelle
- Créer une transaction unique, la modifier et vérifier qu'elle est mise à jour correctement.
- Créer une transaction récurrente (ex. mensuelle), la modifier en choisissant "Toutes les itérations", vérifier que les itérations non modifiées sont mises à jour.
- Modifier une transaction récurrente en choisissant "Les prochaines itérations uniquement", et s'assurer que la transaction existante s'arrête à la veille et qu'une nouvelle transaction commence à la date d'effet, avec les itérations adaptées.
