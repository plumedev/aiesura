# Spécification Fonctionnelle & Technique : Problème de création de plan dans les flux mensuels (AES-44)

## 1. Contexte & Objectif
Suite à l'implémentation de la fonctionnalité des flux mensuels (AES-40), les retours d'utilisation consignés dans le ticket Linear **AES-44** rapportent trois anomalies / besoins d'amélioration :
1. Une erreur 500 sur le point d'accès `POST /api/monthly-checklists` lors de la génération du plan mensuel.
2. Un schéma visuel des flux (`FlowDiagram.vue`) non fonctionnel ou vide lorsque le plan du mois n'est pas encore généré.
3. Une tronquature excessive de la liste des dépenses incluses dans les règles récurrentes de virement (`RulesList.vue`), empêchant leur consultation complète.

Cette spécification définit les corrections techniques et ergonomiques à apporter.

---

## 2. Spécifications Détaillées

### 2.1 Backend : Robustesse & Validation du point d'accès `POST /api/monthly-checklists`
- **Fichier impacté :** `server/api/monthly-checklists/index.post.ts`
- **Modification du schéma Zod `stepSchema` :**
  - Permettre les valeurs `null` ou `undefined` sur `sourceAccountId`, `transitAccountId` et `destAccountId` via `.optional().nullable()`, ou garantir leur présence sous forme de chaînes UUID non vides.
  - S'assurer que le handler renvoie une erreur HTTP 400 claire avec les détails des erreurs Zod si le body est invalide, sans faire crasher l'exécution Nitro en erreur 500 unhandled.

### 2.2 Composable Frontend : Sécurisation de `generateSteps` (`useFlowPlanner.ts`)
- **Fichier impacté :** `app/composables/useFlowPlanner.ts`
- **Mise à jour :**
  - Dans la construction de chaque objet `ChecklistStep`, s'assurer d'extraire de manière sécurisée les identifiants de compte : `rule.sourceAccount?.id || ''` et `rule.destinationAccount?.id || ''`.
  - Garantir l'intégrité du typage `ChecklistStep` renvoyé au serveur.

### 2.3 Frontend : Dynamicité du Schéma Visuel des Flux (`FlowDiagram.vue`)
- **Fichier impacté :** `app/components/flows/FlowDiagram.vue`
- **Comportement attendu :**
  - Le composant `FlowDiagram` doit calculer dynamiquement les flux d'abord à partir de `props.steps` si une checklist existe pour le mois.
  - En l'absence de `steps` (plan non encore généré pour le mois sélectionné), le composant doit calculer les flux directement à partir de `props.rules` (en calculant les montants estimatifs ou récurrents du mois).
  - Cela permet au schéma visuel d'être fonctionnel immédiatement dès que l'utilisateur crée ou consulte ses règles de transfert, même avant d'avoir cliqué sur "Générer le plan".

### 2.4 Frontend : Consultation Complète des Dépenses dans les Règles (`RulesList.vue`)
- **Fichier impacté :** `app/components/flows/RulesList.vue`
- **Comportement attendu :**
  - Pour les règles de type `recurring`, remplacer la chaîne unique tronquée (`truncate`) par une liste lisible et extensible.
  - Proposer un affichage multi-badges ou un bloc dépliable (*Collapsible / Accordéon*) permettant de voir chaque transaction liée avec :
    - Son nom
    - Son compte d'origine
    - Son montant et son pourcentage appliqué (ex: `Loyer - 800,00 € (100%)`).

---

## 3. Matrice d'impact & Fichiers à modifier

1. `server/api/monthly-checklists/index.post.ts` — Assainissement Zod et gestion d'erreur.
2. `app/composables/useFlowPlanner.ts` — Sécurisation des IDs de comptes dans `generateSteps`.
3. `app/components/flows/FlowDiagram.vue` — Fallback sur `rules` et calcul dynamique des cartes visuelles.
4. `app/components/flows/RulesList.vue` — Remplacement de la ligne `truncate` par une consultation détaillée des dépenses incluses.

---

## 4. Stratégie de Validation
- `npm run lint` — Doit passer sans aucune alerte ni erreur.
- `npm run typecheck` — Doit passer sans aucune erreur de typage TypeScript.
- Test manuel du flux de génération de plan et de la consultation des règles.
