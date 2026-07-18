# Design System

Ce fichier documente les conventions de design et d'UI à respecter dans l'application pour garantir une cohérence visuelle.

## Tableaux (Tables)

* **Couleurs de fond (Containers) :** `#F1F5F3` en mode light et `#0C3C32` en mode dark.
* **En-têtes (Headers) :**
  * Fond légèrement teinté : `bg-black/5` en light, `bg-white/5` en dark (ou équivalent solide).
  * Texte : `font-semibold`, couleur pleine (`text-gray-900` / `dark:text-white`). Format de texte normal (pas de majuscule forcée).
  * **Comportement Sticky :** Tous les en-têtes de tableaux doivent être épinglés en haut par défaut (`sticky top-0 z-10`), avec un effet de flou (`backdrop-blur-md`) et un fond légèrement transparent (`bg-white/90 dark:bg-[#0C3C32]/90`) pour que le défilement soit élégant.
