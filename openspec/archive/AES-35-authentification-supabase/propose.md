# Proposition de Feature

**Titre** : Intégration de l'authentification Supabase (Ticket AES-35)
**Statut** : Approuvé (Apply & Archive terminés)

## Contexte de la proposition
Le projet nécessitait une base sécurisée pour identifier les utilisateurs avant de construire les fonctionnalités métiers. Nous avions le choix entre gérer l'authentification de bout en bout (sessions/JWT, hachage, envoi d'emails) ou déléguer à un BaaS.

## Solution proposée
Utiliser Supabase Auth combiné au module Nuxt officiel.
- **Pourquoi ?** : Accélère drastiquement le développement, gestion des e-mails out-of-the-box, sécurisé par défaut.
- **Impact local** : Le schéma BDD est conservé localement via Drizzle (table `profiles`) pour lier nos données métiers à l'UID Supabase.

## Flux validé par l'utilisateur (Workflow)
1. `/opsx:explore` -> Discussion sur la nécessité de l'authentification.
2. `/opsx:propose` -> (Rétroactivement documenté ici).
3. `/opsx:apply` -> Écriture du code, migrations BDD, création des vues.
4. Correctifs UI (migration Nuxt UI `UFormGroup` -> `UFormField`).
5. Correctifs UX (Redirection du reset password vers `/update-password`).
