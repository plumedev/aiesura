# Design System

Ce fichier documente les conventions de design et d'UI à respecter dans l'application pour garantir une cohérence visuelle.

## Tableaux (Tables)

* **Couleurs de fond (Containers) :** `#F1F5F3` en mode light et `#0C3C32` en mode dark.
* **En-têtes (Headers) :**
  * Fond légèrement teinté : `bg-black/5` en light, `bg-white/5` en dark (ou équivalent solide).
  * Texte : `font-semibold`, couleur pleine (`text-gray-900` / `dark:text-white`). Format de texte normal (pas de majuscule forcée).
  * **Comportement Sticky :** Tous les en-têtes de tableaux doivent être épinglés en haut par défaut (`sticky top-0 z-10`), avec un effet de flou (`backdrop-blur-md`) et un fond légèrement transparent (`bg-white/90 dark:bg-[#0C3C32]/90`) pour que le défilement soit élégant.

## Éléments Élevés (Modales, Popovers, Dropdowns, Notifications)
* **Modales & Cartes :** Fond solide `#F1F5F3` en light et `#0C3C32` en dark (`.glass-panel`) pour garantir une opacité parfaite et une lisibilité sans parasite visuel.
* **Overlay des Modales :** L'overlay d'arrière-plan des modales applique un flou léger et élégant (`backdrop-blur-[2.5px]`).
* **Notifications (Toasts) :** Fond translucide avec effet de flou (`.toast-glass` : `rgba(241, 245, 243, 0.40)` en light, `rgba(12, 60, 50, 0.45)` en dark avec `backdrop-filter: blur(14px)`).

## Scrollbars
* **Intégration Visuelle :** Toutes les scrollbars de l'application doivent utiliser une largeur fine (`scrollbar-width: thin` / `8px`) avec des coins arrondis (`border-radius: 9999px`).
* **Couleurs Light Mode :** Curseur `#C2D1C9` (hover `#A3B8AC`), rail transparent.
* **Couleurs Dark Mode :** Curseur `#155A4C` (hover `#1F7A67`), rail transparent.
