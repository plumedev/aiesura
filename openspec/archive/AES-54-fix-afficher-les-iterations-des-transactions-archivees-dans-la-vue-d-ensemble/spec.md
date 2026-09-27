# AES-54: Fix - Afficher les itérations des transactions archivées dans la vue d'ensemble

## Contexte
Lorsqu'une transaction récurrente arrive à échéance (`endDate` dépassée), elle est automatiquement archivée côté serveur (`archivedAt = now` via AES-53). De même, un utilisateur peut archiver manuellement une transaction via AES-52.
Cependant, dans l'API de la vue d'ensemble (`server/api/overview/transactions.get.ts`), la requête filtrait systématiquement avec `isNull(transactions.archivedAt)`.
Conséquence : dès qu'une transaction est archivée ou terminée, toutes ses itérations (y compris celles valides s'étant exécutées le mois courant ou les mois passés) disparaissaient visuellement de la liste des transactions du dashboard, alors même que le résumé KPI (`/api/overview/summary`) les comptabilisait correctement.

---

## Besoins & Spécification Fonctionnelle
1. **Inclusion des itérations dans la vue d'ensemble :**
   - La vue d'ensemble (`/api/overview/transactions`) doit afficher toutes les itérations dont la date d'exécution est comprise dans la période sélectionnée (`between(transactionIterations.executionDate, start, end)`), quel que soit le statut d'archivage de la transaction parente.
   - Suppression du filtre `isNull(transactions.archivedAt)` dans `server/api/overview/transactions.get.ts`.

2. **Cohérence avec le KPI Summary :**
   - Le total des transactions affichées dans la liste correspond désormais exactement aux montants agrégés du résumé (`totalExpenses`, `totalIncome`, `balance`).

---

## Plan d'Action
1. Modifier `server/api/overview/transactions.get.ts` pour supprimer `isNull(transactions.archivedAt)` des conditions de transaction parente.
2. Vérifier la validité avec `npm run lint` et `npm run typecheck`.
3. Valider le fonctionnement en exécutant les tests.
