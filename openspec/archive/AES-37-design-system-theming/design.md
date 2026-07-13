# Design Décisions : AES-37

## Tokens de Couleurs

### Light Mode
- **App Background** : `#FFFFFF`
- **Surface (Cartes, Modals)** : `#F8F4F0` (Sable)
- **Text Main** : `#343434`
- **Primary Button** :
  - Fond : `#0A332C`
  - Texte : `#FFFFFF`
  - Hover : `#0F5040`
- **Secondary Button** :
  - Fond : `#50E8A8`
  - Texte : `#343434`
  - Hover : `#A1EACA`

### Dark Mode
- **App Background** : `#0A332C` (Vert foncé de base)
- **Surface (Cartes, Modals)** : `#0F5040`
- **Text Main** : `#FFFFFF`
- **Primary Button** :
  - Fond : `#50E8A8`
  - Texte : `#343434`
  - Hover : `#A1EACA`
- **Secondary Button** :
  - Fond : `rgba(255, 255, 255, 0.1)` (Glassmorphism / Translucide)
  - Texte : `#FFFFFF`
  - Hover : `rgba(255, 255, 255, 0.2)`

## Typographie
- Font-family : `Outfit` (importée de Google Fonts).

## Effets Spéciaux
- **Glassmorphisme** : Utilisé via une classe utilitaire `.glass-panel` combinant `backdrop-blur`, `bg-opacity` et bordures subtiles translucides pour le mode sombre ou les toasts.
- **Arrondis** : `rounded-md` (Professionnel, classique).
