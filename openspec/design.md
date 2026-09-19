# Design System & Conventions Graphiques

Ce document centralise l'ensemble des règles de design, conventions d'interface utilisateur et tokens graphiques du projet SDD.

---

## 1. Palette de Couleurs & Tokens de Fond

| Élément | Thème Clair (Light) | Thème Sombre (Dark) | Description |
| :--- | :--- | :--- | :--- |
| **Fond des conteneurs (Cards, Modales, Tables)** | `#F1F5F3` | `#0C3C32` | Fond standard de tous les panneaux et cartes applicatifs |
| **Fond de la Sidebar** | `#DCE8E2` | `#0C3C32` (ou `bg-elevated/25`) | Fond de navigation latéral avec démarcation subtile |
| **Fond général de l'application (App background)** | `#FFFFFF` | `#0A332C` | Arrière-plan global |
| **Accentuation Principale (Primary Dark Green)** | `#0A332C` | `#0A332C` | Vert forêt profond utilisé pour les sélections, boutons et états actifs |
| **Texte principal** | `#111827` (ou `#343434`) | `#FFFFFF` | Haute lisibilité et contraste élevé |
| **Texte atténué (Muted / Placeholders)** | `#9CA3AF` / `#6B7280` | `#9CA3AF` / `#6B7280` | Labels secondaires, dates et placeholders |

---

## 2. Uniformisation des Champs de Formulaire (Inputs, Selects, Textareas)

Tous les champs interactifs (`UInput`, `USelect`, `USelectMenu`, `UTextarea`, `UInputDate`) doivent respecter strictement les tokens suivants :

* **Arrière-plan (Background) :**
  * Light : `bg-white/60 hover:bg-white/80 focus:bg-white` (aspect translucide verre dépoli).
  * Dark : `bg-black/25 hover:bg-black/35 focus:bg-black/40`.
* **Bordures :**
  * Light : `border border-black/10 hover:border-black/20 focus:border-black/30`.
  * Dark : `border border-white/10 hover:border-white/20 focus:border-white/30`.
* **Dimensions & Forme :**
  * Hauteur standardisée : `h-9` (36px).
  * Arrondi : `rounded-md`.
  * Typographie : `text-sm font-medium`.
* **Placeholders Obligatoires :**
  * Tout champ doit comporter un attribut `placeholder` descriptif (ex: `placeholder="Ex: 50.00"`, `placeholder="Tous les comptes"`).
  * Style du placeholder : `placeholder:text-gray-400 dark:placeholder:text-gray-500 font-normal`.
  * Valeur sélectionnée : `text-gray-900 dark:text-white font-medium`.

---

## 3. Sélecteurs de Date (`UCalendar` & `OwlDatePicker`)

Pour garantir une expérience utilisateur fluide et cohérente sur les sélecteurs de date :

* **États Selected (Sélectionné) & Hover (Survol) :**
  * En mode **Light** comme en mode **Dark**, l'élément sélectionné ou survolé adopte un fond **vert foncé** (`#0A332C`) et une typographie blanche (`#FFFFFF`).
* **Plage sélectionnée (`highlighted` / `in-range`) :**
  * Fond vert foncé translucide (`rgba(10, 51, 44, 0.3)` en light / `rgba(10, 51, 44, 0.6)` en dark) avec typographie contrastée.
* **Panneau de Raccourcis de Période :**
  * Disposition pleine largeur sans marge interne (`rounded-none px-6 justify-start`).
  * Au survol (`hover`) et actif (`selected`) : fond vert foncé (`#0A332C`) avec texte blanc.
* **Boutons de navigation (`<<`, `<`, `>`, `>>`) :**
  * Au survol : fond vert foncé (`#0A332C`) et icônes blanches.

---

## 4. Modales & Actions Destructives

* **Modales de confirmation :**
  * Toute confirmation ou suppression destructive **DOIT** utiliser une modale Nuxt UI personnalisée (`AppModal` / `UModal`).
  * Les alertes ou boîtes de dialogue natives du navigateur (`confirm()`, `alert()`) sont strictement interdites.
* **Boutons d'action :**
  * Actions principales : bouton plein (`color="primary"` ou `color="error"` pour les destructions irréversibles).
  * Actions d'annulation : bouton fantôme ou contour (`variant="ghost"` ou `variant="outline"`).

---

## 5. Tableaux & Listes

* **En-têtes fixes (Sticky) :** `sticky top-0 z-10 backdrop-blur-md bg-gray-50/90 dark:bg-[#11463B]/90 border-b border-default text-gray-900 dark:text-white`.
* **Colonnes triables :** Utiliser la fonction de rendu partagée `sortableHeader(label)`.
