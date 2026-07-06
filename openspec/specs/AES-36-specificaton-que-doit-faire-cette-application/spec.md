# Spécification Fonctionnelle : Orchestrateur de Virements Mensuels

## 1. Contexte & Cible
L'application cible une gestion financière personnelle avancée (multi-comptes). Plutôt qu'un simple tracker de dépenses au jour le jour, l'outil se positionne comme un **"Orchestrateur du 1er du mois"**. Il permet de modéliser une architecture de comptes bancaires complexes (Perso, Revolut, Joint, Cartes prépayées) et de générer un plan de routage de l'argent.

## 2. Fonctionnalités Clés (User Stories)

### Modélisation de l'Architecture Bancaire
- **En tant qu'** utilisateur, **je veux** pouvoir déclarer mes différents comptes physiques ou virtuels (ex: Compte Perso principal, Revolut, Pockets, Compte Joint).
- **En tant qu'** utilisateur, **je veux** attacher mes revenus et charges fixes à un compte spécifique (ex: Le salaire arrive sur le Compte Perso, le loyer sort du Compte Perso).

### Moteur de Règles & Enveloppes (Groupement Dynamique)
- **En tant qu'** utilisateur, **je veux** renseigner finement toutes mes dépenses fixes (ex: Netflix 14€, Spotify 11€, Pocket Essence 50€).
- **En tant qu'** utilisateur, **je veux** pouvoir créer une règle de virement (ex: Perso -> Revolut) en y associant/sélectionnant plusieurs dépenses fixes. Le montant du virement sera automatiquement calculé comme la somme de ces dépenses.
- **En tant qu'** utilisateur, **je veux** aussi pouvoir créer une règle avec un montant fixe brut si je ne souhaite pas la lier à des dépenses précises.

### Génération de la "To-Do List" de Virements
- **En tant qu'** utilisateur, **je veux** que l'application génère automatiquement, au début du mois, la liste exacte des virements (cascade) que je dois effectuer manuellement sur mes applications bancaires.
- **En tant qu'** utilisateur, **je veux** pouvoir cocher chaque virement de ma To-Do list pour m'assurer que l'argent est bien à sa place pour le mois.

## 3. Critères d'acceptation (Scope V1)
- L'application ne s'occupe PAS de pointer les dépenses quotidiennes. L'objectif est rempli dès que l'argent est réparti sur les comptes finaux (qui font alors office de limiteurs naturels).
- Le moteur gère les flux uniquement à l'échelle du mois projeté (pas de synchronisation des vrais soldes bancaires).
