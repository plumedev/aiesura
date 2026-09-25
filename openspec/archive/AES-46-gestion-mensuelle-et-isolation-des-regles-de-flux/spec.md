# AES-46: Gestion mensuelle et isolation des règles de flux

## 1. Contexte & Problématique
Actuellement, les règles de virement (`transfer_rules`) sont globales. Toute modification ou suppression d'une règle impacte rétroactivement et prospectivement l'ensemble de l'application.

Dans la réalité de la gestion budgétaire, un utilisateur peut avoir besoin d'ajuster un montant, de changer temporairement un compte ou de suspendre/supprimer un virement sur un mois donné (ex : suspension de l'épargne en décembre pour les fêtes, ou ajout d'un virement ponctuel en mai), **sans que cela n'altère les règles par défaut des autres mois**.

Cette spécification définit l'architecture **Blueprint (Modèle par défaut) & Instance Mensuelle** permettant une isolation stricte par mois.

---

## 2. Choix de Conception & Expérience Utilisateur (UX)

### 2.1 Modèle Blueprint & Instance Mensuelle
- **Modèle Blueprint (`transfer_rules`) :** Sert de gabarit par défaut récurrent (Loyer, Épargne récurrente, etc.).
- **Instance Mensuelle (`monthly_checklists.steps`) :** Dès qu'un plan mensuel est généré pour un mois (`YYYY-MM`), la liste des étapes (`steps`) devient la copie de travail isolée de ce mois.

### 2.2 Modalités d'interaction

1. **Modification d'une règle :**
   - Lorsqu'un utilisateur clique sur « Modifier » depuis la vue d'un mois :
     - Il peut éditer le nom, la source, le transit, la destination, le type et le montant.
     - Au moment de sauvegarder, si un plan existe pour le mois, il peut choisir entre :
       - **« Ce mois uniquement »** : La modification est appliquée uniquement dans le plan mensuel (`monthly_checklists.steps`) du mois actif.
       - **« Modèle global (tous les mois) »** : La modification met à jour le modèle permanent dans `transfer_rules`.

2. **Suppression d'une règle :**
   - Lorsqu'un utilisateur clique sur « Supprimer » sur une règle :
     - Une modale personnalisée (`AppModal`) propose :
       - **« Retirer de ce mois uniquement »** : Supprime l'étape correspondante de la checklist du mois (`monthly_checklists.steps`). Les autres mois et le modèle global restent inchangés.
       - **« Supprimer définitivement le modèle »** : Supprime la règle globale de la table `transfer_rules`.

3. **Création d'une règle :**
   - Possibilité de créer soit :
     - Une **règle permanente** (modèle global ajouté à `transfer_rules`).
     - Un **virement ponctuel** (ajouté directement aux `steps` du plan du mois en cours).

---

## 3. Spécifications Techniques

### 3.1 Backend & Base de données

#### Enrichissement du type `ChecklistStep` (`server/database/schema.ts` et `app/types/index.d.ts`)
Ajout de métadonnées pour tracer l'origine de l'étape :
```ts
export type ChecklistStep = {
  ruleId: string
  name: string
  sourceName: string
  sourceAccountId: string
  transitName: string | null
  transitAccountId: string | null
  destName: string
  destAccountId: string
  amount: number
  completed: boolean
  transitCompleted: boolean
  amountType: string
  isMonthlyOverride?: boolean // true si modifiée ou créée uniquement pour ce mois
}
```

#### Endpoints API Nitro
- **`server/api/monthly-checklists/index.post.ts`** :
  - Accepte et enregistre les `steps` complets avec l'indicateur `isMonthlyOverride`.
- **`server/api/monthly-checklists/[id].patch.ts`** :
  - Permet la mise à jour granulaire des `steps` (cochage, modification de montant/comptes, suppression d'un step).
  - Validation stricte Zod avec `readValidatedBody` et contrôle de propriété `userId`.

### 3.2 Frontend (Vue 3 / Composables / Composants)

1. **`app/composables/useFlowPlanner.ts`** :
   - Adapter `generateSteps` pour fusionner intelligemment les étapes personnalisées existantes du mois avec les règles blueprint lors d'un recalcul.

2. **`app/components/flows/RuleFormModal.vue`** :
   - Intégrer le choix de portée de sauvegarde : **« Ce mois uniquement »** vs **« Modèle global »**.
   - Permettre la modification d'une étape spécifique au mois sans impacter le blueprint.

3. **`app/components/flows/RulesList.vue`** :
   - Modale de confirmation de suppression à deux choix : **« Retirer de ce mois »** ou **« Supprimer le modèle global »**.
   - Badge visuel indiquant les étapes modifiées/ponctuelles propres au mois actif.

4. **`app/pages/dashboard/flows.vue`** :
   - Orchestration des actions de mise à jour/suppression mensuelle vs globale.
   - Synchronisation immédiate du schéma visuel (`FlowDiagram.vue`) et de la TodoList (`TodoList.vue`).

---

## 4. Matrice d'impact & Fichiers à modifier

1. `server/database/schema.ts` & `app/types/index.d.ts` — Enrichissement du type `ChecklistStep`.
2. `server/api/monthly-checklists/[id].patch.ts` — Validation Zod et handler de mise à jour des étapes du mois.
3. `app/composables/useFlowPlanner.ts` — Préservation des modifications spécifiques au mois.
4. `app/components/flows/RuleFormModal.vue` — Support du choix de portée lors de l'enregistrement.
5. `app/components/flows/RulesList.vue` — Support du choix de portée lors de la suppression et affichage des règles du mois.
6. `app/pages/dashboard/flows.vue` — Gestion de l'état réactif et déclenchement des mises à jour isolées.

---

## 5. Stratégie de Validation

- **Qualité de code obligatoire :**
  - `npm run lint` — 0 erreur, 0 warning.
  - `npm run typecheck` — 0 erreur de typage TypeScript.
- **Tests unitaires :**
  - `npm run test` (Vitest) — Vérification de `generateSteps` et de la conservation des étapes mensuelles.
- **Tests fonctionnels manuels :**
  - 1. Créer une règle globale (ex: Épargne 200 €).
  - 2. Générer le plan de Mai 2026.
  - 3. Modifier le montant à 100 € pour « Ce mois uniquement ».
  - 4. Vérifier que Mai 2026 affiche 100 € et que Juin 2026 / les règles globales restent à 200 €.
  - 5. Supprimer une règle pour « Ce mois uniquement » en Mai 2026 et vérifier qu'elle reste présente en Juin 2026.
