# AES-50 — Liste mobile des transactions avec swipe actions

**Ticket Linear :** [AES-50](https://linear.app/aesura/issue/AES-50/liste-mobile-des-transactions-avec-swipe-actions)  
**Statut :** Proposed  
**Branche Git :** `main`  
**Rédigé le :** 2026-09-25  

---

## 1. Contexte & Problématique Mobile

Sur mobile (`< lg`), la consultation des listes de transactions (Dashboard et page Transactions) souffre des limitations des tableaux tabulaires traditionnels :
1. **Nécessité de scroller horizontalement :** Pour consulter le compte, le type, le montant et les boutons d'actions, l'utilisateur doit faire défiler horizontalement un tableau de plus de 600px de large.
2. **Perte de vue d'ensemble :** L'utilisateur ne dispose pas d'une lecture directe et synthétique de ses opérations.
3. **Actions masquées derrière des menus déroulants :** Les actions (Modifier, Supprimer, Réinitialiser) nécessitent d'ouvrir un dropdown menu souvent étroit sur smartphone.

L'objectif de cette fonctionnalité est d'introduire une vue mobile dédiée sous forme de cartes d'opérations interactives, affichant l'intégralité des informations sans scroll horizontal et proposant une révélation fluide des actions par glissement tactile (swipe vers la gauche).

---

## 2. Décisions de Design & Spécifications Visuelles

| # | Sujet | Décision |
|---|-------|----------|
| **D1** | **Affichage adaptatif (Mobile vs Desktop)** | Sur grand écran (`lg:`), conserver les tableaux complets actuels. Sur mobile (`< lg`), afficher la nouvelle liste de cartes verticales sans aucun défilement horizontal. |
| **D2** | **Structure d'une carte (de gauche à droite)** | Chaque ligne de transaction se compose de 3 zones horizontales alignées :<br>1. **Gauche :** Badge circulaire avec icône Revenu (vert / flèche montante) ou Dépense (rouge / flèche descendante).<br>2. **Centre (flex-1) :** Nom de la transaction en haut (`font-medium text-sm text-gray-900 dark:text-white truncate`). En dessous, une sous-ligne compacte avec : à gauche le compte (`text-xs text-gray-500 truncate`), à droite le nombre d'itérations (`text-xs text-gray-400` avec chevron indicateur si > 1).<br>3. **Droite :** Montant total formaté (`formatAmount`, en vert ou rouge, typographie `font-semibold text-sm whitespace-nowrap`). |
| **D3** | **Gestion des itérations multiples (Dashboard)** | Lorsqu'une transaction regroupe plusieurs itérations (`iterationCount > 1`), un tap sur la carte déplie/replie la liste de ses itérations enfants sous forme de sous-lignes indentées. Chaque sous-itération est elle-même swipeable individuellement. |
| **D4** | **Gestuelle Swipe-to-Reveal (Glissement gauche)** | En faisant glisser (swiper) l'élément vers la gauche avec le doigt :<br>- Le contenu coulisse en douceur vers la gauche (`translateX(-Xpx)`).<br>- Les boutons d'actions apparaissent sur le côté droit.<br>- Un swipe vers la droite ou un tap ailleurs referme immédiatement l'élément.<br>- L'ouverture d'une ligne referme automatiquement toute autre ligne déjà ouverte. |
| **D5** | **Blocs d'actions carrés compacts** | Les boutons d'actions sont stylisés sous forme de blocs carrés distincts (`h-12 w-12 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-transform shadow-sm`) :<br>- **Dashboard :** Bouton "Modifier" (bleu/neutre avec crayon) + Bouton "Réinitialiser" (ambre avec flèche rotative si `isModified`).<br>- **Page Transactions :** Bouton "Éditer" (bleu/neutre avec crayon) + Bouton "Supprimer" (rouge avec corbeille, déclenchant la modale personnalisée `UModal`). |
| **D6** | **Composant réutilisable & Cohérence Design** | Création d'un composant dédié réutilisable (`MobileSwipeableRow.vue` ou similaire) pour garantir une expérience identique entre la page d'accueil du Dashboard (`/dashboard`) et la page dédiée aux transactions (`/dashboard/transactions`), respectant scrupuleusement les fonds de conteneurs (`#F1F5F3` / `#0C3C32`) et le thème glassmorphism. |

---

## 3. Plan d'Implémentation

1. **Création du composant `MobileSwipeableRow.vue` :**
   - Implémentation du conteneur tactile avec écouteurs `touchstart`, `touchmove`, `touchend` (ou `@vueuse/core` `useSwipe`).
   - Gestion de l'état ouvert/fermé avec seuil de déclenchement (threshold) et inertie douce.
   - Emplacement des slots pour le contenu principal et les boutons d'actions carrés.
2. **Intégration sur le Dashboard (`app/pages/dashboard/index.vue`) :**
   - Remplacement du tableau horizontal mobile par la liste de cartes `MobileSwipeableRow`.
   - Affichage de l'icône, libellé, compte, badge d'itérations et montant.
   - Gestion du dépliage des itérations au clic.
   - Actions au swipe : Modifier l'itération (`openEditModal`), Réinitialiser (`resetIteration`).
3. **Intégration sur la page Transactions (`app/pages/dashboard/transactions.vue`) :**
   - Remplacement de la vue mobile de `transactions.vue`.
   - Actions au swipe : Éditer (`openEditModal`), Supprimer (`confirmDelete`).
4. **Validation de qualité & Tests :**
   - Exécution conjointe de `npm run lint` et `npm run typecheck`.
   - Test et audit des gestes de swipe et de l'affichage dans le navigateur sur viewport mobile (390×844 et 501×658).
