# Proposition de Feature & Correctifs UI Post-MEP

**Titre** : Correctifs UI Post-MEP (Ticket AES-43)
**Statut** : Approuvé & Archivé

## Contexte de la proposition
Suite à la première mise en production (MEP), plusieurs retours d'ergonomie et de lisibilité ont été remontés par les utilisateurs (modales trop transparentes, absence de date de fin lors de l'onboarding, scrollbars génériques du navigateur, forme du stepper).

## Solution proposée
1. Ajuster l'opacité et le flou des modales (`.glass-panel`) et notifications (`.toast-glass`).
2. Ajouter le champ optionnel "Date de fin" dans les formulaires d'onboarding (revenus et dépenses).
3. Intégrer un calcul dynamique et une mention d'information (`occurrenceCount`) sous le sélecteur de plage temporelle.
4. Styliser les scrollbars globales (mode clair et sombre).
5. Exiger un attribut `placeholder` sur tous les champs de saisie de l'application (enregistré dans `AGENTS.md`).
