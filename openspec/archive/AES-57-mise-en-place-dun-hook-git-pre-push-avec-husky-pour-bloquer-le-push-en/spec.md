# AES-57: Mise en place d'un hook Git pre-push avec Husky pour bloquer le push en cas de régression

## Contexte & Objectifs
Garantir la non-régression de l'application Aiesura avant chaque envoi de code sur le dépôt distant (`git push`).
En intégrant Husky et un hook Git `pre-push`, chaque tentative de push déclenchera automatiquement la suite de tests complète (`npm run alltest` : tests unitaires Vitest et tests fonctionnels E2E Maestro en mode headless).
Si l'un des tests échoue, le push est immédiatement bloqué. En cas d'urgence opérationnelle, l'utilisateur conserve la possibilité d'outrepasser cette vérification via l'option native Git `--no-verify`.

---

## Spécifications Fonctionnelles & Techniques

### 1. Installation de Husky
- Dépendance de développement : `husky` installée via `npm i -D husky`.
- Initialisation des hooks Husky dans le répertoire `.husky/`.

### 2. Configuration du Hook `pre-push`
- Fichier : `.husky/pre-push`
- Contenu du script :
  ```sh
  echo "🔍 Vérification des non-régressions avant push..."
  npm run alltest
  ```
- Si le script renvoie un code de sortie différent de 0, Git interrompt le push avec un message explicite.

### 3. Gestion du Bypass ("Force push sans test")
- Grâce au standard Git, tout développeur peut contourner l'exécution du hook en ajoutant l'argument `--no-verify` :
  ```bash
  git push --no-verify
  ```
  ou
  ```bash
  git push --force --no-verify
  ```
- Un message informatif sera affiché dans le terminal rappelant cette possibilité en cas d'échec.

### 4. Automatisation de l'installation du hook pour l'équipe
- Intégration de `husky` dans le script `prepare` de [package.json](file:///c:/Users/lenov/Documents/Side%20projects/Projet%20SDD/package.json) afin que le hook soit automatiquement activé après un `npm install`.

---

## Plan d'Action

- [x] **Étape 1 :** Installer Husky en dépendance de développement.
- [x] **Étape 2 :** Initialiser Husky et créer le fichier de hook `.husky/pre-push` appelant `npm run alltest`.
- [x] **Étape 3 :** Mettre à jour `package.json` pour configurer le script `prepare` / `postinstall`.
- [x] **Étape 4 :** Valider l'exécution du hook et s'assurer que le bypass `--no-verify` est documenté.
- [x] **Étape 5 :** Exécuter automatiquement `npm run lint` et `npm run typecheck` pour garantir la conformité du projet.
