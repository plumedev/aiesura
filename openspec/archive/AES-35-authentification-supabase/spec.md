# Spécification Fonctionnelle : Authentification Supabase

## 1. Contexte
Mise en place d'un système d'authentification complet et sécurisé basé sur Supabase Auth, intégré avec Nuxt 3 et Drizzle ORM.

## 2. Fonctionnalités (User Stories)
- **En tant qu'** utilisateur, **je veux** pouvoir m'inscrire avec mon adresse e-mail et un mot de passe.
- **En tant qu'** utilisateur, **je veux** recevoir un e-mail de confirmation pour valider mon compte.
- **En tant qu'** utilisateur, **je veux** pouvoir me connecter à mon compte.
- **En tant qu'** utilisateur, **je veux** pouvoir demander la réinitialisation de mon mot de passe en cas d'oubli.
- **En tant qu'** utilisateur, **je veux** accéder à un espace privé (Dashboard) une fois connecté.

## 3. Critères d'acceptation
- Les routes `/dashboard` (et sous-routes) sont inaccessibles aux utilisateurs non connectés (redirection vers `/login`).
- Les mots de passe ne sont pas stockés en clair (géré par Supabase).
- Les formulaires gèrent l'état de chargement et affichent des messages d'erreur clairs.
