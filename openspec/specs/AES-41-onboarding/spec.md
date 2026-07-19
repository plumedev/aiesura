# Spécification Fonctionnelle : Onboarding Utilisateur (AES-41)

## 1. Contexte & Objectif
Pour guider les nouveaux utilisateurs dans la configuration initiale de leur espace de gestion financière, une fonctionnalité d'onboarding interactive est mise en place. Elle permet d'ajouter pas à pas les comptes bancaires, les revenus, les dépenses et les règles de transfert d'argent, qui constituent les briques de base de l'application.

L'onboarding est **totalement optionnel** et l'utilisateur peut le quitter ou l'ignorer à tout moment.

---

## 2. Spécifications Fonctionnelles (Critères d'acceptation)

### 2.1 Suivi de l'état d'onboarding
- La table `profiles` contient une colonne `onboarded` (boolean, par défaut `false`).
- Si un utilisateur authentifié a `onboarded = false`, il est redirigé automatiquement vers la page `/dashboard/onboarding` lors de ses tentatives d'accès à l'espace `/dashboard/*`.
- Les pages publiques (`/`, `/login`, `/register`, `/forgot-password`, `/confirm`, `/update-password`) sont exclues de cette redirection.
- Dès que l'utilisateur clique sur "Quitter l'onboarding" ou termine la dernière étape, son statut passe à `onboarded = true` en base de données et il est redirigé vers le `/dashboard` principal.

### 2.2 Layout de la page d'onboarding
- La page `/dashboard/onboarding` s'affiche en plein écran (ou via le layout par défaut sans la sidebar de navigation standard).
- **Écran scindé verticalement (2 colonnes) :**
  - **Partie gauche (Stepper + Explications) :**
    - Affiche un indicateur visuel (stepper) de l'étape courante (1 à 4).
    - Pour chaque étape, affiche un titre et un texte d'explication pédagogique clair.
    - Contient un bouton secondaire permettant d'ignorer complètement l'onboarding à tout moment ("Quitter l'onboarding").
  - **Partie droite (Interactivité) :**
    - Contient la zone d'interaction pour l'étape courante.
    - Permet de saisir les informations via un formulaire simple.
    - Affiche instantanément la liste des entités créées lors de cette étape pour donner un feedback visuel immédiat (ex: liste des comptes créés).
    - En bas, des boutons de navigation : "Étape précédente" (sauf étape 1) et "Étape suivante" (ou "Terminer l'onboarding" à l'étape 4).

### 2.3 Les Étapes de l'Onboarding
1. **Étape 1 : Création des comptes**
   - L'utilisateur peut créer ses comptes bancaires (Nom, icône, couleur).
   - Le premier compte créé est défini automatiquement comme compte principal (`isMain = true`).
2. **Étape 2 : Création des revenus**
   - L'utilisateur peut saisir ses revenus récurrents ou ponctuels (Nom, montant, fréquence, date de début, compte associé).
   - Ces transactions sont créées avec le type `income`.
3. **Étape 3 : Création des dépenses**
   - L'utilisateur peut saisir ses dépenses récurrentes ou ponctuelles (Nom, montant, fréquence, date de début, compte associé).
   - Ces transactions sont créées avec le type `expense`.
4. **Étape 4 : Création des règles de virement**
   - L'utilisateur peut définir des règles de transfert (Compte source, compte destination, compte transit optionnel, type de montant fixe/récurrent, montant).
   - Ces règles sont créées dans la table `transfer_rules`.

---

## 3. Notes d'implémentation technique

### 3.1 Base de données (Drizzle)
Modification de `server/database/schema.ts` :
```ts
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  onboarded: boolean('onboarded').default(false).notNull(), // Ajout
  createdAt: timestamp('created_at').defaultNow().notNull()
})
```

### 3.2 Endpoints API Nitro
1. **GET `/api/profile` :**
   - Récupère le profil de l'utilisateur connecté via `requireUser(event)`.
2. **POST `/api/profile/complete-onboarding` :**
   - Met à jour la colonne `onboarded` à `true` pour l'utilisateur connecté.

### 3.3 Middleware Nuxt
Fichier `app/middleware/auth-onboarding.global.ts` :
- Vérifie si l'utilisateur est connecté via `useSupabaseUser()`.
- Si connecté, récupère le profil (mis en cache via `useState` pour éviter des requêtes répétées).
- Si `onboarded === false` et que la route n'est pas exclue, redirige vers `/dashboard/onboarding`.

### 3.4 Design & UI
- Fond des cartes/sections : `#F1F5F3` en mode light et `#0C3C32` en mode dark.
- Respect strict des types TypeScript et des composants Nuxt UI.
- Pas d'assignations directes de variables d'état dans le template Vue (ex: `@click="isOpen = false"`).
