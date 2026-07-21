# Règles du Projet (SDD Nuxt 3)

Ces règles définissent le workflow strict à suivre pour ce projet. Je dois m'y conformer à chaque interaction.

## Workflow Spec-Driven Development (SDD)

1.  **Idéation (Linear) :** Toutes les nouvelles idées de fonctionnalités doivent commencer par la création d'un ticket Linear. Je peux créer ce ticket pour l'utilisateur s'il me l'exprime.
2.  **Spécification (OpenSpec) :** AVANT d'écrire la moindre ligne de code pour une nouvelle fonctionnalité, je DOIS utiliser OpenSpec (`openspec/specs/`) pour générer la spécification formelle, les décisions de design et le plan d'action, en me basant sur le ticket Linear.
3.  **Validation :** Je dois toujours demander à l'utilisateur de valider le *Spec Delta* généré par OpenSpec avant de coder.
4.  **Implémentation :** Le code est écrit pour satisfaire la spécification.

## Stack Technologique

*   **Frontend / Backend :** Nuxt 3 (VueJS 3 + TypeScript, Nitro).
*   **UI :** Nuxt UI et Tailwind CSS.
*   **Base de données :** PostgreSQL.
*   **ORM :** Drizzle ORM.
*   **Tests :** Vitest (Unit) et Playwright (E2E).
*   **Gestionnaire de paquets :** npm.

## Comportement Attendu

*   Je dois être proactif dans la proposition de création de tickets Linear.
*   Je ne dois jamais coder "à l'aveugle" sans qu'une spec ne soit d'abord actée dans le dossier OpenSpec.
*   Lorsqu'un choix technique ou métier s'impose (notamment en phase d'idéation/exploration), je dois SYSTÉMATIQUEMENT utiliser l'outil interactif `ask_question` pour soumettre les options à l'utilisateur, plutôt que de poser la question au format texte.
*   **Qualité du code :** Après chaque modification de code (implémentation ou refactoring), je dois AUTOMATIQUEMENT exécuter conjointement `npm run lint` ET `npm run typecheck` SANS demander de confirmation à l'utilisateur. Je dois utiliser ces commandes pour vérifier la validité du projet et corriger les erreurs éventuelles avant de finaliser ma réponse.

## Conventions de Nommage
*   **Dossiers OpenSpec :** Tout dossier de spécification créé dans `openspec/specs/` DOIT impérativement inclure le numéro de ticket Linear et reprendre son titre. (Exemple : `openspec/specs/AES-35-authentification-supabase/spec.md`). Cela permet une traçabilité parfaite entre Linear et le code.

## Commandes OpenSpec (Workflow Core Profile)
Bien que les "slash commands" natives de l'interface soient limitées, je **dois** réagir aux directives suivantes tapées dans le chat, conformément au "Default Quick Path" d'OpenSpec :

*   `/opsx:explore` : Phase d'exploration. Je discute avec l'utilisateur pour transformer une idée floue en une solution précise, sans encore rédiger de code ou d'artefact.
*   `/opsx:propose [idée]` : Je rédige la proposition (scénarios, specs) dans le dossier `openspec/` et je demande validation.
*   `/opsx:apply` : J'entame la phase d'implémentation concrète (écriture du code et des tests) pour satisfaire la spécification validée.
*   `/opsx:sync` : Je synchronise, mets à jour et vérifie que le code correspond parfaitement à la spec.
*   `/opsx:archive` : La feature est terminée, les specs sont fusionnées comme "Living Documentation" définitive.

## Bonnes Pratiques Vue 3 / TypeScript
*   **Événements (`@click`, etc.) :** Ne jamais utiliser d'assignation directe en ligne (ex: `@click="isOpen = false"`) car cela retourne un booléen et casse le typage strict (`void`) attendu par les composants (notamment Nuxt UI). Déclarer systématiquement une méthode dédiée dans le `<script setup>` (ex: `const closeModal = () => { isOpen.value = false }`).

## Design & UI
*   **Couleurs des conteneurs :** Le fond des conteneurs (cartes, tableaux, etc.) doit être `#F1F5F3` en mode light et `#0C3C32` en mode dark pour conserver la cohérence visuelle du projet.
*   **Modales de confirmation :** Toute action de confirmation ou de suppression destructive DOIT être développée avec un composant de modale personnalisé (`UModal`) de Nuxt UI. L'utilisation des alertes ou confirmations natives du navigateur (`confirm()`, `alert()`) est strictement interdite.
*   **Design System (`design.md`) :** Chaque fois qu'une nouvelle convention de design est introduite ou modifiée (ex: style de tableau, header sticky, couleur de bouton), je DOIS demander à l'utilisateur s'il faut mettre à jour le fichier `openspec/design.md` pour refléter ce changement.

## Conventions API Serveur (Nitro / Drizzle)

*   **Authentification centralisée :** Chaque handler API DOIT utiliser `requireUser(event)` depuis `~~/server/utils/auth` pour récupérer l'utilisateur et son `userId`. Il est INTERDIT de dupliquer la logique `user?.id || user?.sub` directement dans un handler.
    ```ts
    import { requireUser } from '~~/server/utils/auth'

    export default defineEventHandler(async (event) => {
      const { userId } = await requireUser(event)
      // ...
    })
    ```

*   **Validation des body avec Zod :** Tout handler qui reçoit un body DOIT valider les données avec `zod` + `readValidatedBody`. L'utilisation de validations manuelles (`if (!name)`) est interdite. Le schéma Zod DOIT être déclaré en dehors du handler (au niveau module) pour éviter de le recréer à chaque requête.
    ```ts
    const mySchema = z.object({ name: z.string().min(1) })

    export default defineEventHandler(async (event) => {
      const body = await readValidatedBody(event, body => mySchema.safeParse(body))
      if (!body.success) throw createError({ statusCode: 400, message: 'Données invalides', data: body.error.issues })
      // ...
    })
    ```

*   **Ownership des ressources :** Toute requête de modification ou suppression DOIT inclure `eq(table.userId, userId)` dans la clause `where` de Drizzle pour garantir qu'un utilisateur ne peut accéder qu'à ses propres données.

## Conventions Frontend (Vue 3 / Utils partagés)

*   **Formatage centralisé :** Les fonctions de formatage et les constantes de labels DOIVENT être définies dans `app/utils/index.ts` et non re-déclarées localement dans une page ou un composant. Les fonctions disponibles sont :
    *   `formatDate(date)` — date en `jj/mm/aaaa` locale française
    *   `formatFrequency(freq)` — traduit `'monthly'` → `'Mensuel'`, etc.
    *   `formatAmount(amount, type?)` — formate en euros avec signe `+`/`-`
    *   `TRANSACTION_TYPE_LABELS` — record `{ income: 'Revenu', expense: 'Dépense' }`
    *   `FREQUENCY_LABELS` — record de toutes les fréquences

*   **Headers de tableaux triables :** Pour les colonnes triables dans `UTable`, utiliser une render function `sortableHeader(label)` définie dans le `<script setup>` plutôt que de dupliquer un template `#xxx-header` par colonne. Voir `app/pages/dashboard/transactions.vue` comme référence.

*   **Pas de types fantômes :** Le fichier `app/types/index.d.ts` ne doit contenir que des types réellement utilisés dans le projet. Les résidus du template de base Nuxt (User, Mail, Member, Stat, Sale…) ont été supprimés.
