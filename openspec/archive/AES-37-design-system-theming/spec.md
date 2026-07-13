# Spécification: Design System & Theming

## Objectif
Mettre en place un design système robuste s'appuyant sur Nuxt UI v3 et Tailwind CSS v4, en intégrant un mode clair (Light) et un mode sombre (Dark) cohérent.

## Principes Généraux
- Utilisation de la typographie `Outfit`.
- Bordures légèrement arrondies (`rounded-md`).
- Définition de couleurs sémantiques strictes (Fond, Surface, Boutons, Textes).
- Apparition du "Glassmorphisme" pour détacher certains éléments.

## Implémentation technique
- `app/assets/css/main.css` : Configuration du thème Tailwind v4 via `@theme static` et variables CSS contextuelles (`:root` vs `.dark`).
- `app/app.config.ts` : Personnalisation globale des composants Nuxt UI v3 (UButton, UCard, UModal) pour forcer le `rounded-md` et intégrer les fonds customisés.
- `app.vue` : S'assurer que le body ou le conteneur principal prend bien le fond `bg-[var(--color-bg-app)]`.
