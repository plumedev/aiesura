# AES-56: Mise en place de la suite de tests fonctionnels E2E avec Maestro

## Contexte & Objectifs
Intégrer formellement Maestro Web comme solution d'automatisation des tests fonctionnels end-to-end (E2E) pour l'application Nuxt 3 Aiesura. Cette suite permet de tester les parcours utilisateurs réels de manière déclarative en YAML (authentification, formulaires, navigation, dashboards) via Chromium, en mode visuel local ou headless en CI.

---

## Spécifications Fonctionnelles & Techniques

### 1. Arborescence & Emplacement des Scénarios
- Création du répertoire dédié `tests/e2e/maestro/`.
- Nettoyage des fichiers temporaires exploratoires créés dans `scratch/`.

### 2. Scénarios Maestro Initiaux
- **`tests/e2e/maestro/connexion-compte-existant.yaml`** :
  - `url` : `http://localhost:3000/login`
  - `name` : `"Connexion avec compte existant et redirection dashboard"`
  - Vérification de la présence du formulaire de connexion (`.*Connectez-vous.*`).
  - Saisie de l'adresse email et du mot de passe.
  - Clic sur le bouton de connexion avec regex résiliente (`.*Se connecter.*`).
  - Attente (`extendedWaitUntil`) de l'arrivée sur le dashboard (`.*Vue d'ensemble.*`).
  - Assertion de présence de la section du tableau de bord.

- **`tests/e2e/maestro/connexion-identifiants-invalides.yaml`** :
  - `url` : `http://localhost:3000/login`
  - `name` : `"Connexion avec mot de passe incorrect et message d'erreur"`
  - Saisie d'identifiants erronés.
  - Clic sur le bouton de connexion.
  - Assertion de l'apparition de l'alerte d'erreur d'authentification (`Invalid login credentials`).

### 3. Scripts d'Automatisation dans `package.json`
Ajout de scripts npm dédiés pour exécuter facilement les tests :
- `"test:maestro"` : Exécution headless de tous les flows Maestro (`maestro test tests/e2e/maestro/ --headless --screen-size 1280x800`).
- `"test:maestro:gui"` : Exécution interactive avec navigateur visible pour le développement local (`maestro test tests/e2e/maestro/`).
- `"test:maestro:report"` : Exécution headless avec génération d'un rapport HTML (`maestro test tests/e2e/maestro/ --headless --screen-size 1280x800 --format HTML`).
- `"alltest"` : Lance l'intégralité des tests (unitaires Vitest + fonctionnels Maestro en headless dans le terminal).
- `"alltest:ui"` : Lance l'intégralité des tests (unitaires Vitest + fonctionnels Maestro avec navigateur Chromium visible).

### 4. Exclusion Git
- `report.html` ajouté dans `.gitignore` pour ne jamais versionner les rapports générés localement.

### 4. Bonnes Pratiques de Rédaction des Flows
- Cibler directement la route de la fonctionnalité testée (ex: `/login`) pour s'affranchir de la dépendance à l'état de session sur la page d'accueil.
- Définir systématiquement un `name` explicite dans chaque flow YAML.
- Utiliser des expressions régulières pour cibler les textes et boutons sensibles aux espaces de template (`.*Libellé.*`).

---

## Plan d'Action

- [x] **Étape 1 :** Créer le répertoire `tests/e2e/maestro/` et y placer les scénarios `connexion-compte-existant.yaml` et `connexion-identifiants-invalides.yaml`.
- [x] **Étape 2 :** Ajouter les scripts npm Maestro dans [package.json](file:///c:/Users/lenov/Documents/Side%20projects/Projet%20SDD/package.json).
- [x] **Étape 3 :** Valider l'exécution des tests Maestro avec la nouvelle commande.
- [x] **Étape 4 :** Exécuter automatiquement `npm run lint` et `npm run typecheck` pour garantir la conformité du projet.
