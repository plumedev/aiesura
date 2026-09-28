# AES-55: Suppression de compte dans les paramètres

## Contexte & Objectifs
Offrir aux utilisateurs la possibilité de supprimer définitivement et de façon irréversible leur compte ainsi que l'intégralité de leurs données personnelles et financières depuis la page des paramètres (`/dashboard/settings`). Cette fonctionnalité garantit la conformité RGPD (droit à l'effacement) et assure qu'aucune donnée orpheline ne subsiste en base de données.

---

## Spécifications Fonctionnelles

### 1. Interface Utilisateur (Page `/dashboard/settings`)
- **Zone de Danger :**
  - Ajout d'une section "Zone de danger" en bas de la page des paramètres.
  - Carte `UCard` utilisant les couleurs du design system (`#F1F5F3` en thème clair, `#0C3C32` en thème sombre).
  - Titre de section : `Zone de danger`.
  - Intitulé : `Supprimer mon compte`.
  - Description : `Une fois votre compte supprimé, toutes vos données (comptes bancaires, transactions, règles de virement, planification et historique) seront définitivement effacées. Cette action est irréversible.`
  - Bouton déclencheur : `UButton` avec `color="error"`, `variant="solid"`, icône `i-heroicons-trash`, label `Supprimer mon compte`.

### 2. Modale de Confirmation Destructive (`AppModal`)
- Intégration du composant existant `AppModal` (interdiction stricte de `window.confirm()`).
- Titre : `Supprimer définitivement votre compte`.
- Icône : `i-heroicons-exclamation-triangle` (classe rouge).
- Contenu explicatif :
  - Rappel clair et solennel de la portée de l'action.
  - Instruction : `Pour confirmer cette action irréversible, veuillez taper `**SUPPRIMER**` dans le champ ci-dessous :`
  - Champ de saisie `<UInput>` avec `placeholder="Tapez SUPPRIMER pour confirmer"`, requis et réactif.
- Bouton de confirmation :
  - `confirmLabel="Supprimer définitivement mon compte"`.
  - `confirmColor="error"`.
  - Désactivé tant que la valeur saisie n'est pas exactement égale à `SUPPRIMER`.
  - Affiche un état de chargement (`loading`) pendant l'appel API.
- Bouton d'annulation :
  - Ferme la modale et réinitialise le champ de saisie.

### 3. Endpoint Serveur Nitro (`DELETE /api/profile`)
- **Fichier :** `server/api/profile/index.delete.ts`.
- **Authentification :** Utilise `requireUser(event)` pour extraire le `userId` authentifié.
- **Suppression des données applicatives :**
  - Suppression de la ligne de profil : `DELETE FROM profiles WHERE id = userId`.
  - Grâce aux contraintes `ON DELETE CASCADE` de toutes les tables dépendantes (`accounts`, `transactions`, `monthly_flows`, `transaction_iterations`, `transfer_rules`, `transfer_rule_iterations`, `monthly_checklists`), toutes les données associées sont immédiatement supprimées.
- **Suppression du compte d'authentification Supabase :**
  - Suppression directe dans la table d'authentification : `DELETE FROM auth.users WHERE id = userId::uuid`.
- **Réponse :** `{ success: true, message: 'Compte et données supprimés avec succès' }`.

### 4. Flux Post-Suppression Côté Client
1. Appel réussi à `DELETE /api/profile`.
2. Déconnexion locale de l'utilisateur via `supabase.auth.signOut()`.
3. Réinitialisation des états locaux (ex: `users-onboarded-map`).
4. Affichage d'un toast informatif vert ou neutre :
   - Titre : `Compte supprimé`.
   - Description : `Votre compte et l'ensemble de vos données ont été définitivement supprimés.`
5. Redirection vers la page d'accueil `/`.

---

## Plan d'Action & Découpage

- [x] **Étape 1 :** Créer le handler API `server/api/profile/index.delete.ts`.
- [x] **Étape 2 :** Mettre à jour `app/pages/dashboard/settings.vue` pour ajouter la Zone de Danger et la modale `AppModal` avec saisie obligatoire de "SUPPRIMER".
- [x] **Étape 3 :** Valider la conformité du code avec `npm run lint` et `npm run typecheck`.
- [x] **Étape 4 :** Tester le fonctionnement de bout en bout (ouverture modale, validation du mot-clé, suppression, déconnexion et redirection).
