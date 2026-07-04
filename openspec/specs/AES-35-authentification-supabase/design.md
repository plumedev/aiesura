# Décisions de Design (Architecture & Choix Techniques)

## 1. Stack Technique
- **Auth Provider** : Supabase Auth (via le module `@nuxtjs/supabase`).
- **ORM** : Drizzle ORM (avec PostgreSQL).
- **UI** : Nuxt UI (`UFormField`, `UInput`, `UButton`, `UCard`).

## 2. Modèle de Données (Base de Données)
- Table locale `profiles` gérée par Drizzle.
- La clé primaire `id` est de type `UUID` et mappée directement avec `auth.users.id` de Supabase. Cela évite les doublons d'authentification tout en permettant de stocker des données métiers locales liées à l'utilisateur.

## 3. Sécurité et Redirections
- Utilisation des `redirectOptions` de `@nuxtjs/supabase` pour protéger toutes les routes par défaut.
- Routes explicitement exclues : `/`, `/login`, `/register`, `/forgot-password`, `/update-password`.
- Le flux de réinitialisation de mot de passe pointe explicitement vers `/update-password` (et non `/login`) pour éviter toute confusion d'UX.
