# Authentification & Inscription Utilisateur (Supabase)

## Objectif
Permettre à un nouvel utilisateur de créer un compte, de s'authentifier, de réinitialiser son mot de passe et de vérifier son e-mail en utilisant le service géré **Supabase Auth**.

## Spécifications (Critères d'acceptation)

### Inscription (Page `/register`)
- **Scénario : Inscription avec Supabase**
  - GIVEN un visiteur sur la page `/register`
  - WHEN il soumet le formulaire avec un email et un mot de passe
  - THEN un compte est créé dans le schéma `auth.users` de Supabase
  - AND un e-mail de confirmation lui est envoyé (géré par Supabase)
  - AND il est redirigé vers une page l'invitant à vérifier ses e-mails.

### Connexion (Page `/login`)
- **Scénario : Connexion réussie**
  - GIVEN un utilisateur dont l'e-mail est vérifié
  - WHEN il soumet le formulaire de connexion
  - THEN sa session Supabase est initialisée
  - AND il est redirigé vers `/dashboard`

### Mot de passe oublié (Page `/forgot-password`)
- **Scénario : Demande de réinitialisation**
  - GIVEN un visiteur sur la page de mot de passe oublié
  - WHEN il soumet son adresse e-mail
  - THEN un e-mail contenant un lien de réinitialisation est envoyé par Supabase.

### Redirection & Protection (Middleware)
- **Scénario : Accès protégé**
  - GIVEN un visiteur non connecté
  - WHEN il tente d'accéder à `/dashboard`
  - THEN il est redirigé vers `/login`

## Notes d'implémentation (Design decisions)
- **UI :** Composants `Nuxt UI`.
- **Session & Mails :** Module `@nuxtjs/supabase`. Gestion 100% déléguée à Supabase (finis les soucis de sécurité locaux).
- **BDD (Drizzle) :** La table `users` actuelle sera renommée en `profiles` et liée par clé étrangère à l'ID UUID généré par Supabase. Le ticket technique AES-35 (qui prévoyait un `password_hash` local) est donc obsolète.
