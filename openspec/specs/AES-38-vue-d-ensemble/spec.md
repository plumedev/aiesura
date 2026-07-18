# AES-38 — Page "Vue d'ensemble"

**Ticket Linear :** AES-38
**Statut :** Backlog
**Branche Git :** `feat/synthesis-page`
**Rédigé le :** 2026-07-16

---

## 1. Contexte & Objectif

La page "Vue d'ensemble" est le tableau de bord de consultation budgétaire mensuelle. Elle permet à l'utilisateur de visualiser, sur une plage de dates choisie, la synthèse financière (dépenses, revenus, solde) ainsi que le détail des transactions et de leurs itérations effectives.

> **Concept clé – l'itération :** Une transaction récurrente (ex: loyer mensuel sur 12 mois) génère autant d'**itérations** qu'il y a d'occurrences dans la plage sélectionnée. Ces itérations sont **matérialisées en base de données** afin de pouvoir être modifiées individuellement.

---

## 2. Décisions de design

| # | Sujet | Décision |
|---|-------|----------|
| D1 | Nom de la page | **"Vue d'ensemble"** — route `/dashboard` (page index du dashboard) |
| D2 | Sélecteur de période | Propre à cette page uniquement — pas partagé |
| D3 | Modification d'itération | Ouvre une **modale** de mise à jour directe (nom, montant, type, date d'exécution) |
| D4 | Scroll du tableau | **Scroll infini** — pas de pagination |
| D5 | Architecture BDD | Nouvelle table **`transaction_iterations`** liée à `transactions` |
| D6 | Génération des itérations | **Dynamique** — générées à la création de la transaction sur un horizon glissant |
| D7 | Itérations sans `endDate` | Générées sur un horizon fixe de **24 mois** à partir de `startDate` |

---

## 3. Schéma de base de données

### 3.1 Nouvelle table : `transaction_iterations`

```sql
CREATE TABLE transaction_iterations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  execution_date TIMESTAMP NOT NULL,
  amount         NUMERIC(10, 2) NOT NULL,
  name           TEXT NOT NULL,
  type           TEXT NOT NULL,       -- 'income' | 'expense'
  is_modified    BOOLEAN DEFAULT FALSE NOT NULL,
  created_at     TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### 3.2 Drizzle ORM — schema.ts

Ajouter dans `server/database/schema.ts` :
- Table `transactionIterations`
- Relation `transactionIterationsRelations` : `many` côté `transactions`, `one` côté `transactionIterations → transactions`

Migration : `npx drizzle-kit generate` + `npx drizzle-kit migrate`

### 3.3 Logique de génération

Helper `server/utils/generateIterations.ts` appelé après chaque INSERT de transaction :

| Fréquence | Logique |
|-----------|---------|
| `once` | 1 itération à `startDate` |
| `monthly` | 1/mois entre `startDate` et `endDate` (ou +24 mois si null) |
| `quarterly` | 1 tous les 3 mois |
| `yearly` | 1 par an |

---

## 4. API — Nouveaux endpoints Nitro

### 4.1 GET /api/overview/summary

**Query params :** `startDate`, `endDate` (ISO 8601)

**Response :**
```ts
{ totalExpenses: number; totalIncome: number; balance: number }
```

Logique : SUM des `amount` des `transaction_iterations` dont `execution_date ∈ [startDate, endDate]`.

---

### 4.2 GET /api/overview/transactions

Retourne les transactions avec itérations groupées + scroll infini (cursor-based).

**Query params :**
- `startDate`, `endDate` (requis)
- `search?` — filtre nom
- `type?` — `income` | `expense`
- `accountId?` — répétable (multiselect)
- `amountRange?` — `small` | `medium` | `large`
- `cursor?` — ID dernière transaction (pagination)
- `limit?` — défaut 20

**Response :**
```ts
{
  items: TransactionWithIterations[]
  nextCursor: string | null
}
```

---

### 4.3 PATCH /api/overview/iterations/[id]

**Body :**
```ts
{
  name?: string
  amount?: number
  type?: 'income' | 'expense'
  executionDate?: string
}
```

**Effet :** Met à jour l'itération + pose `is_modified = true`.

---

## 5. Frontend

### 5.1 Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `app/pages/dashboard/index.vue` | MODIFIER (stub → page complète) |
| `app/composables/useOverview.ts` | CRÉER |
| `app/types/overview.ts` | CRÉER |
| `app/components/overview/IterationEditModal.vue` | CRÉER |
| `server/utils/generateIterations.ts` | CRÉER |
| `server/api/overview/summary.get.ts` | CRÉER |
| `server/api/overview/transactions.get.ts` | CRÉER |
| `server/api/overview/iterations/[id].patch.ts` | CRÉER |
| `server/database/schema.ts` | MODIFIER |

### 5.2 Composable `useOverview.ts`

- `dateRange` : `ref<{ start: Date; end: Date }>` initialisé sur le mois courant
- `summary` : `useFetch` réactif sur `dateRange`
- `items` : tableau accumulatif pour scroll infini
- `nextCursor` : pour charger la page suivante
- `filters` : `{ search, type, accountIds, amountRange }`
- `loadMore()` : charge la page suivante
- `refreshAll()` : reset cursor + recharge tout

### 5.3 Sélecteur de période

Composant `UCalendar` en mode date range picker. Raccourcis :

| Label | Dates |
|-------|-------|
| Ce mois-ci | 1er → dernier jour du mois courant |
| Le mois prochain | 1er → dernier jour du mois suivant |
| Cette année | 01/01 → 31/12 de l'année courante |
| L'année suivante | 01/01 → 31/12 de l'année N+1 |
| L'année précédente | 01/01 → 31/12 de l'année N-1 |

### 5.4 Blocs KPI

3 `UCard` en ligne :

| Carte | Icône | Couleur |
|-------|-------|---------|
| Dépenses | `i-heroicons-arrow-down-left` | `error` |
| Revenus | `i-heroicons-arrow-up-right` | `success` |
| Solde | `i-heroicons-scale` | `primary` (rouge si < 0) |

Format : `1 234,56 €` (Intl.NumberFormat fr-FR).

### 5.5 Filtres

```
[ 🔍 Recherche ]  [ Type ▼ ]  [ Comptes ▼ ]  [ Montant ▼ ]
```

- **Recherche** : `UInput` — filtre sur le nom
- **Type** : `USelect` — Tous / Revenu / Dépense
- **Comptes** : `USelectMenu` multiselect — liste des comptes user
- **Montant** : `USelect` — Tous / Petit (<50€) / Moyen (50–500€) / Gros (>500€)

Chaque changement de filtre reset le cursor et relance la requête.

### 5.6 Tableau des transactions

`UTable` avec colonnes : Libellé · Itérations (UBadge, caché si count=1) · Compte · Type (UBadge) · Montant total · Actions (3 points)

**Ligne dépliable** (si `iterationCount > 1`) : sous-tableau avec Date · Libellé · Montant · Badge "Modifiée"

**Scroll infini** : `useInfiniteScroll` VueUse sur le conteneur, appelle `loadMore()`.

**Menu 3 points** sur chaque itération :
- "Modifier" → ouvre `IterationEditModal`

### 5.7 Modale `IterationEditModal.vue`

Props: `iteration: TransactionIteration`
Emits: `close`, `success`

Formulaire : Libellé (UInput) · Montant (UInput number) · Type (USelect) · Date d'exécution (UCalendar)

Submit → `PATCH /api/overview/iterations/:id` → toast → emit `success` → `refreshAll()`

---

## 6. Types TypeScript (`app/types/overview.ts`)

```ts
export interface OverviewSummary {
  totalExpenses: number
  totalIncome: number
  balance: number
}

export type AmountRange = 'small' | 'medium' | 'large'
export type TransactionType = 'income' | 'expense'

export interface TransactionIteration {
  id: string
  executionDate: string
  amount: number
  name: string
  type: TransactionType
  isModified: boolean
}

export interface TransactionWithIterations {
  id: string
  name: string
  type: TransactionType
  account: { id: string; name: string }
  iterationCount: number
  totalAmount: number
  iterations: TransactionIteration[]
}

export interface OverviewFilters {
  search: string
  type: TransactionType | null
  accountIds: string[]
  amountRange: AmountRange | null
}
```

---

## 7. Plan d'action

```
Phase 1 — BDD
  [ ] 1.1 Ajouter transactionIterations dans schema.ts + relations
  [ ] 1.2 Générer + appliquer la migration Drizzle
  [ ] 1.3 Créer server/utils/generateIterations.ts

Phase 2 — API
  [ ] 2.1 Modifier POST /api/transactions → appeler generateIterations
  [ ] 2.2 Créer GET /api/overview/summary
  [ ] 2.3 Créer GET /api/overview/transactions
  [ ] 2.4 Créer PATCH /api/overview/iterations/[id]

Phase 3 — Frontend
  [ ] 3.1 Créer app/types/overview.ts
  [ ] 3.2 Créer app/composables/useOverview.ts
  [ ] 3.3 Créer app/components/overview/IterationEditModal.vue
  [ ] 3.4 Implémenter app/pages/dashboard/index.vue

Phase 4 — Qualité
  [ ] 4.1 Tests Vitest sur generateIterations
  [ ] 4.2 npm run lint + typecheck
```

---

## 8. Hors périmètre (AES-38)

- Suppression d'une itération individuelle
- Régénération des itérations si la transaction parente est modifiée après coup
- Notifications ou alertes budgétaires
- Export CSV/PDF
