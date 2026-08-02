# Spécification Fonctionnelle & Technique : Correctifs UI Post-MEP (AES-43)

## 1. Contexte & Objectif
Suite au retour des tests post-Mise En Production (MEP), plusieurs ajustements d'ergonomie, de design system et de formulaires ont été apportés pour améliorer l'expérience utilisateur et la lisibilité globale de l'application Aiesura.

Cette spécification consigne l'ensemble des ajustements validés et implémentés pour le ticket Linear **AES-43**.

---

## 2. Spécifications Fonctionnelles & Ergonomiques

### 2.1 Lisibilité, Modales & Notifications (Glassmorphism)
- **Modales & Cartes (`.glass-panel`) :** Fond solide `#F1F5F3` en mode clair et `#0C3C32` en mode sombre pour garantir une opacité parfaite et éliminer tout parasite visuel avec le contenu sous-jacent.
- **Overlay d'arrière-plan des modales (`modal.overlay`) :** Application d'un effet de flou discret et élégant (`bg-black/30 backdrop-blur-[2.5px] dark:bg-black/50 backdrop-blur-[2.5px]`).
- **Notifications & Toasts (`.toast-glass`) :** Fond dépoli translucide (`rgba(241, 245, 243, 0.40)` en light mode, `rgba(12, 60, 50, 0.45)` en dark mode avec `backdrop-filter: blur(14px)`), offrant un effet de verre aérien laissant deviner le contenu en dessous tout en restant parfaitement lisible.

### 2.2 Champ "Date de Fin" dans l'Onboarding (Étapes 2 & 3)
- Ajout d'un toggle et d'un champ de sélection de date optionnel "Date de fin" dans les formulaires de création de revenus (Étape 2) et de dépenses (Étape 3) de l'onboarding.
- Transmission du paramètre `endDate` au format ISO lors de l'appel à l'API `/api/transactions`.

### 2.3 Indication dynamique du nombre d'itérations générées
- Dans le formulaire de création/édition de transaction (`TransactionForm.vue`), lorsque le toggle "Date de fin" est activé, une mention explicative dynamique s'affiche sous le sélecteur de plage :
  > ℹ️ *Soit **X** transaction(s) générée(s)*
- Le nombre d'itérations (`occurrenceCount`) est calculé en temps réel en fonction de la fréquence (Unique, Mensuel, Trimestriel, Annuel) et de la plage temporelle.

### 2.4 Placeholders obligatoires sur les formulaires
- Ajout de l'attribut `placeholder="Ex: 50.00"` sur le champ de saisie du montant dans `TransactionForm.vue`.
- Inscription permanente de la règle dans `.agents/AGENTS.md` : Tout champ de formulaire (`<UInput>`, `<UTextarea>`, etc.) DOIT impérativement comporter un attribut `placeholder` clair et explicatif.

### 2.5 Stepper d'Onboarding
- Ajout des classes `shrink-0` (`flex-shrink-0`) et `aspect-square` sur les indicateurs circulaires d'étapes (`w-9 h-9 rounded-full shrink-0 aspect-square`) afin de prévenir toute déformation flexbox.

### 2.6 Intégration Visuelle des Scrollbars Globales
- Implémentation des règles CSS globales dans `app/assets/css/main.css` pour styliser les scrollbars (Webkit et Firefox `scrollbar-width: thin`) aux coins arrondis (`border-radius: 9999px`).
- Mode light : rail discret, curseur `#C2D1C9` (hover `#A3B8AC`).
- Mode dark : rail discret, curseur `#155A4C` (hover `#1F7A67`).

---

## 3. Fichiers Modifiés & Synchronisés

1. **`app/assets/css/main.css`**
   - Mise à jour de `.glass-panel`, ajout de la classe `.toast-glass` et des scrollbars.
2. **`app/app.config.ts`**
   - Ajustement de `modal.overlay` (`backdrop-blur-[2.5px]`) et `toast.root` (`.toast-glass`).
3. **`app/components/transactions/TransactionForm.vue`**
   - Ajout de `placeholder="Ex: 50.00"`, calcul de `occurrenceCount` et affichage sous la plage de dates.
4. **`app/pages/dashboard/onboarding.vue`**
   - Ajout de `hasEndDate`/`endDate` dans `incomeForm` et `expenseForm` + correction stepper `shrink-0 aspect-square`.
5. **`.agents/AGENTS.md`**
   - Inscription de la règle des placeholders obligatoires sur les formulaires.
6. **`openspec/design.md`**
   - Synchronisation du Design System pour les modales solides, les toasts dépolis et les scrollbars.

---

## 4. Validation & Assurance Qualité
- `npm run lint` : ✅ Validé sans aucune erreur.
- `npm run typecheck` : ✅ Validé sans aucune erreur de typage Nuxt / TypeScript.
