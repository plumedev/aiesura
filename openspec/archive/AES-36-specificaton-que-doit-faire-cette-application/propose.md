# Proposition d'Architecture Complète (AES-36)

**Titre** : Spécification - Planificateur de Cascade Multi-comptes
**Statut** : En attente de validation (Révision 2)

## Pivot suite à l'exploration approfondie
Après discussion détaillée du workflow de l'utilisateur, l'idée originale du "Tracker quotidien" a été totalement abandonnée au profit d'un besoin beaucoup plus pointu et expert : **Un Orchestrateur de Virements pour la gestion Multi-comptes.**

Le besoin n'est pas de tracer le moindre café acheté, mais d'automatiser la charge mentale du 1er du mois :
1. L'argent arrive sur un compte source.
2. Les charges fixes sortent.
3. Le reste doit être ventilé (dispatché) sur d'autres cartes prépayées, des Pockets Revolut ou des Comptes Joints selon des budgets stricts (ex: 50€ essence).
4. Le système (la To-Do List) s'assure que chaque flux est effectué manuellement par l'utilisateur sans erreur. Une fois les enveloppes remplies sur les comptes physiques, les comptes s'auto-régulent par leur solde naturel (on ne peut pas dépenser plus que la carte prépayée).

## Approbation
La validation de cette proposition par `/opsx:archive` fixera le cap définitif de l'application. La prochaine étape technique sera l'implémentation de la Phase 1 (Création des comptes bancaires virtuels dans l'outil).
