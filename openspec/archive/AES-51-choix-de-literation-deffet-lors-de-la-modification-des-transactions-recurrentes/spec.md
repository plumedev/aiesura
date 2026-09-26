# AES-51: Choix de l'itération d'effet lors de la modification des transactions récurrentes

## Contexte
Lorsqu'un utilisateur modifie une transaction récurrente existante (depuis la page `/dashboard/transactions`), il a le choix entre :
1. Modifier toutes les itérations (passées et futures).
2. Modifier uniquement les prochaines itérations (scission de transaction).

### Problème identifié
Actuellement, lorsque l'utilisateur choisit d'appliquer ses modifications aux futures itérations, le système utilise la date du jour (`new Date()`) ou la date de début d'origine (`startDate`), sans laisser l'utilisateur choisir l'itération exacte à partir de laquelle le changement prend effet. 
Par exemple, le 26 septembre, si un utilisateur constate une augmentation du coût d'un abonnement prévue pour octobre, cliquer sur "prochaines itérations" mettait à jour ou scindait la transaction en impactant l'itération de septembre.

## Besoins Utilisateur
- Pouvoir choisir explicitement l'itération (ou date d'effet) à partir de laquelle la modification s'applique.
- Proposer une sélection intelligente par défaut (la première itération dont la date est strictement postérieure à aujourd'hui).
- Conserver l'intégrité des itérations antérieures à cette date d'effet dans la transaction d'origine.

---

## Spécifications Fonctionnelles

### 1. Modale de confirmation d'édition (`TransactionForm.vue`)
- Lorsque l'utilisateur valide le formulaire pour une transaction récurrente, la modale de confirmation propose :
  1. **Toutes les itérations** : applique la mise à jour à l'ensemble des itérations passées et futures non personnalisées.
  2. **À partir d'une itération choisie** :
     - Affiche un sélecteur déroulant (`USelectMenu`) listant les prochaines itérations attendues (ex: "1er oct. 2026", "1er nov. 2026", etc.) ainsi qu'une option personnalisée de date d'effet.
     - L'itération sélectionnée par défaut est la première itération à venir.
     - Un bouton de confirmation applique la scission à compter de cette date d'effet exacte.

### 2. Endpoint Serveur (`PATCH /api/transactions/[id]`)
- Ajout du champ `effectiveDate?: string` dans le schéma Zod de validation.
- En mode `updateMode === 'future'` :
  - La date de scission `effectiveDate` est strictement respectée.
  - La transaction d'origine `T1` voit son `endDate` fixé à la veille de `effectiveDate`.
  - Les itérations de `T1` non modifiées avec une date d'exécution `>= effectiveDate` sont supprimées.
  - Une nouvelle transaction `T2` est créée avec `startDate = effectiveDate` et les nouvelles valeurs saisies.
  - Les itérations personnalisées (`isModified: true`) `>= effectiveDate` sont rattachées à `T2`.
  - Les nouvelles itérations de `T2` sont générées à partir de `effectiveDate`.

---

## Plan d'Implémentation
1. **Serveur (`server/api/transactions/[id].patch.ts`) :**
   - Étendre le schéma Zod avec `effectiveDate: z.string().datetime().optional()`.
   - Utiliser `effectiveDate` pour le partitionnement et le calcul de la veille (`dayBefore`).
2. **Frontend (`app/components/transactions/TransactionForm.vue`) :**
   - Calculer la liste des prochaines itérations disponibles pour la transaction en cours d'édition.
   - Intégrer le sélecteur d'itération/date d'effet dans `showConfirmModal`.
   - Transmettre `effectiveDate` dans le payload envoyé à l'API.
3. **Validation :**
   - `npm run lint` et `npm run typecheck`.
   - Test fonctionnel de scission à une date future.
