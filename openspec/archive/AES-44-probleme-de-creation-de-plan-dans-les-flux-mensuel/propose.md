# Proposition : Résolution des problèmes de création de plan et amélioration visuelle des flux mensuels (AES-44)

**Titre** : Problème de création de plan dans les flux mensuel (Ticket AES-44)  
**Statut** : Proposition en attente de validation  
**Branche Git** : `fix/AES-44-creation-plan-flux-mensuel`  

## Contexte

Lors de l'utilisation du module des flux mensuels (`/dashboard/flows`), plusieurs problèmes majeurs et améliorations ont été constatés suite au retour du ticket Linear AES-44 :

1. **Erreur 500 lors de la génération du plan :** Le clic sur "Générer le plan" (ou "Recalculer le plan") échoue avec une notification d'erreur et une réponse `500 Server Error` sur l'appel `POST /api/monthly-checklists`.
2. **Schéma visuel des flux non fonctionnel / déconnecté :** Avant la génération de la checklist mensuelle (ou lors de la première visite/mise à jour d'une règle), le schéma visuel (`FlowDiagram.vue`) affiche des colonnes vides ("0 sources", "0 transits", "0 destinations") car il dépend exclusivement des `steps` du mois au lieu de pouvoir s'appuyer dynamiquement sur les règles configurées.
3. **Amélioration de la consultation des dépenses dans une règle :** Dans la liste des règles enregistrées (`RulesList.vue`), la liste des transactions/dépenses récurrentes rattachées à une règle est tronquée par un style `truncate` sur une seule ligne (`Inclus : Loyer (100%), EDF (100%), ...`), empêchant la consultation complète.

---

## Solution Proposée

### 1. Correction du crash API `POST /api/monthly-checklists`
- **Diagnostique :** Dans `useFlowPlanner.ts`, la fonction `generateSteps` construit les objets `ChecklistStep` en passant `sourceAccountId: rule.sourceAccount?.id` et `destAccountId: rule.destinationAccount?.id`. Lorsque `rule.sourceAccount` n'a pas son ID immédiatement résolu ou si des champs optionnels sont transmis, les propriétés indéfinies sont omises du JSON stringifié par `$fetch`.
- Le schéma Zod `stepSchema` côté serveur dans `server/api/monthly-checklists/index.post.ts` exige un `z.string().uuid()` strict pour `sourceAccountId` et `destAccountId`, ce qui provoque un échec de validation Zod silencieux et déclenche une erreur 500/400.
- **Correctif :** 
  - Ajuster le schéma Zod `stepSchema` pour autoriser `z.string().uuid().optional().nullable()` sur les identifiants de compte pour lesquels des valeurs par défaut/fallbacks existent.
  - Sécuriser l'assainissement des steps générés par `generateSteps` dans `useFlowPlanner.ts` pour toujours fournir des UUID valides issus des objets de compte.
  - Formater proprement l'erreur dans l'handler Nitro `server/api/monthly-checklists/index.post.ts`.

### 2. Rendement & cohérence du Schéma Visuel (`FlowDiagram.vue`)
- Adapter `FlowDiagram.vue` pour qu'il calcule son modèle de données de flux :
  - Soit à partir des `steps` si la checklist mensuelle est déjà générée.
  - Soit en fallback direct à partir des `rules` si la checklist n'est pas encore créée pour le mois sélectionné.
- Corriger le regroupement des comptes de transit vs destination pour que les virements s'affichent clairement sans comptes disparus.

### 3. Affichage détaillé et consultable des dépenses dans les règles (`RulesList.vue`)
- Retirer la contrainte `truncate` sur une ligne unique.
- Ajouter une section extensible (accordéon / modale / liste multi-lignes de badges) permettant de consulter l'intégralité des transactions et dépenses incluses dans chaque règle récurrente.

---

## Prochaines Étapes
1. Validation de la présente proposition par l'utilisateur.
2. Application des modifications (`/opsx:apply`).
3. Exécution de `npm run lint` et `npm run typecheck`.
