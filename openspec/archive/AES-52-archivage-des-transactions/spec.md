# AES-52: Archivage des transactions

## Contexte
Afin de garder une vue claire et ordonnée de leurs finances, les utilisateurs ont besoin d'archiver certaines transactions (transactions ponctuelles anciennes, abonnements résiliés ou obsolètes) sans pour autant perdre leur historique.

### Besoins Utilisateur
- Pouvoir archiver une transaction depuis la liste des transactions (`/dashboard/transactions`) et la vue mobile (swipe action ou menu).
- Les transactions archivées ne doivent plus apparaître par défaut dans la liste principale des transactions.
- Les transactions archivées sont exclues des projections et flux futurs.
- Un filtre ou toggle permet d'afficher les transactions archivées.
- Une action permet de désarchiver une transaction à tout moment.
- Une modale de confirmation Nuxt UI (`AppModal`) sécurise l'action d'archivage et de désarchivage.

---

## Spécifications Fonctionnelles

### 1. Base de Données
- Ajout de la colonne `archivedAt: timestamp('archived_at')` (nullable) dans la table `transactions` (`server/database/schema.ts`).
- Une transaction est considérée comme active si `archivedAt IS NULL`, et archivée si `archivedAt IS NOT NULL`.

### 2. API Serveur
- **`GET /api/transactions` :**
  - Accepte un paramètre de requête `archived?: 'true' | 'false' | 'all'`.
  - Par défaut (`archived=false`), ne renvoie que les transactions actives (`isNull(transactions.archivedAt)`).
- **`PATCH /api/transactions/[id]/archive` :**
  - Endpoint dédié validant l'ownership `userId`.
  - Body `{ archive: boolean }`.
  - Si `archive === true` : définit `archivedAt = new Date()`. Supprime les itérations futures non échues si récurrente afin de les exclure des flux futurs.
  - Si `archive === false` : remet `archivedAt = null` et régénère les itérations futures si la transaction est récurrente et toujours active (`endDate == null || endDate > now`).

### 3. Frontend & UI
- **Page `/dashboard/transactions` :**
  - Ajout d'un bouton / toggle "Afficher les archivées" dans la barre des filtres.
  - Dans le menu contextuel "…" de chaque ligne de tableau et dans les actions swipe sur mobile :
    - Option "Archiver" avec icône `i-heroicons-archive-box`.
    - Si la transaction est déjà archivée, afficher "Désarchiver" avec icône `i-heroicons-arrow-uturn-left`.
  - Badge discret "Archivée" affiché à côté du statut ou du nom de la transaction lorsqu'on consulte les transactions archivées.
- **Modale de confirmation :**
  - Utilisation de `AppModal` pour confirmer l'archivage avec message explicatif ("Cette transaction ne sera plus visible dans la liste active et sera exclue des flux futurs.").

---

## Plan d'Implémentation
1. **Migration / Schéma Drizzle :**
   - Ajouter `archivedAt` dans `schema.ts`.
   - Exécuter la migration Drizzle (`npx drizzle-kit push` ou migration script).
2. **Handlers Serveur :**
   - Mettre à jour `server/api/transactions/index.get.ts` pour filtrer les transactions archivées.
   - Créer `server/api/transactions/[id]/archive.patch.ts`.
3. **Composants Frontend :**
   - Mettre à jour `app/pages/dashboard/transactions.vue` (filtre, actions tableau, swipe action mobile, modale de confirmation).
   - Intégrer les labels et icônes d'archivage.
4. **Validation :**
   - `npm run lint` et `npm run typecheck`.
   - Tests de navigation, archivage et désarchivage.
