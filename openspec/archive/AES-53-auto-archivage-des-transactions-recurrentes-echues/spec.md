# AES-53: Auto-archivage des transactions récurrentes échues

## Contexte
Actuellement, lorsqu'une transaction récurrente arrive à son terme (sa date de fin `endDate` est dépassée), elle continue d'apparaître indéfiniment dans la liste active des transactions (`/dashboard/transactions`), ce qui encombre le tableau et peut fausser la perception des contrats en cours.
L'utilisateur souhaite que dès que la date de la dernière itération est passée (`endDate < aujourd'hui`), la transaction bascule automatiquement en état archivé.

---

## Besoins Utilisateur & Décisions de Design
1. **Auto-archivage transparent côté serveur :**
   - Dès la lecture des transactions utilisateur (`GET /api/transactions`), les transactions récurrentes échues (`endDate IS NOT NULL`, `endDate < today`, et `archivedAt IS NULL`) sont automatiquement mises à jour en base avec `archivedAt = endDate` (ou `now`).
   - Elles ne sont donc plus renvoyées dans la liste des transactions actives par défaut.
2. **Affichage dans la vue des archivées :**
   - L'utilisateur peut toujours les consulter en cliquant sur « Afficher les archivées ».
   - Un badge distinctif permet de différencier les transactions échues de celles archivées manuellement :
     - Badge « Terminée » (couleur `neutral` / `subtle`) si la transaction a une `endDate` passée.
     - Badge « Archivée » si archivage manuel avant la date de fin.
3. **Action de désarchivage / réactivation :**
   - Si l'utilisateur désarchive une transaction échue, soit il prolonge sa date de fin, soit le système lui permet de la réactiver.

---

## Spécifications Fonctionnelles

### 1. API Serveur (`server/api/transactions/index.get.ts`)
- Définition de `now` (date du jour à 00:00:00).
- Exécution d'une mise à jour automatique en arrière-plan ou avant lecture :
  ```ts
  await db
    .update(transactions)
    .set({ archivedAt: sql`COALESCE(${transactions.endDate}, NOW())` })
    .where(
      and(
        eq(transactions.userId, userId),
        ne(transactions.frequency, 'once'),
        isNotNull(transactions.endDate),
        lt(transactions.endDate, now),
        isNull(transactions.archivedAt)
      )
    )
  ```
- Application des filtres habituels (`archived = true`, `false` ou `all`).

### 2. Frontend (`app/pages/dashboard/transactions.vue`)
- Dans le tableau des transactions et dans la liste mobile :
  - Lorsqu'on consulte les transactions archivées (`showArchived === true`) :
    - Si `tx.endDate && new Date(tx.endDate) < now` : afficher le badge **« Terminée »**.
    - Sinon : afficher le badge **« Archivée »**.
- Mise à jour des totaux récurrents mensualisés (excluant naturellement les transactions archivées/terminées).

---

## Plan d'Implémentation
1. **API Serveur :**
   - Mettre à jour [server/api/transactions/index.get.ts](file:///c:/Users/lenov/Documents/Side%20projects/Projet%20SDD/server/api/transactions/index.get.ts) pour intégrer la mise à jour d'auto-archivage des transactions échues.
2. **Frontend UI :**
   - Adapter [app/pages/dashboard/transactions.vue](file:///c:/Users/lenov/Documents/Side%20projects/Projet%20SDD/app/pages/dashboard/transactions.vue) pour afficher le badge adapté (« Terminée » vs « Archivée »).
3. **Contrôle Qualité :**
   - Exécution conjointe de `npm run lint` et `npm run typecheck`.
