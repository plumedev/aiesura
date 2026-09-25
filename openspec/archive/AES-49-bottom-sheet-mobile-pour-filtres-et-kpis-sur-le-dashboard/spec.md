# AES-49 — Bottom sheet mobile pour filtres et KPIs sur le Dashboard

**Ticket Linear :** AES-49  
**Statut :** Proposed  
**Branche Git :** `main`  
**Rédigé le :** 2026-09-25  

---

## 1. Contexte & Problématique Mobile

Sur la page d'accueil du Dashboard (`/dashboard`), l'écran mobile est actuellement saturé verticalement par plusieurs blocs superposés :
1. La navbar supérieure (titre + bouton d'action + toggle).
2. Le sélecteur de période analysée.
3. Les 3 cartes KPI (Revenus, Dépenses, Solde).
4. Le bloc de filtres (Recherche, Type, Comptes, Montant).

Cette accumulation relègue le tableau de transactions dans la partie inférieure de l'écran (ou sous la ligne de flottaison), empêchant l'utilisateur de consulter ses dépenses et rentrées d'argent au premier coup d'œil.

---

## 2. Solution d'UI & Décisions de Design

| # | Sujet | Décision |
|---|-------|----------|
| **D1** | Priorité à la liste des transactions sur mobile | Sur mobile (`< lg`), masquer le bloc fixe de filtres et les 3 grandes cartes KPI du flux principal. Le tableau de transactions prend immédiatement 100% de la hauteur utile sous la navbar. |
| **D2** | Barre basse rétractable (État réduit) | Fixer en bas d'écran (`fixed bottom-0 inset-x-0`) un bandeau compact comprenant :<br>- Une poignée tactile (handle) centrale incitant au swipe / clic.<br>- La période actuellement analysée (ex : "Septembre 2026") avec indicateur de filtres actifs s'il y en a.<br>- Hauteur compacte (~56px-64px) ne masquant qu'une infime partie basse, avec padding bottom adapté aux zones de navigation smartphone (`pb-safe`). |
| **D3** | Tiroir inférieur interactif (`UDrawer`) | Au clic sur la poignée ou par glissement vers le haut, ouverture d'un `UDrawer` (direction bottom, propulsé nativement par `vaul-vue` via Nuxt UI) avec fermeture par swipe vers le bas ou clic extérieur. |
| **D4** | Compteurs sur une seule ligne | Dans le tiroir ouvert, afficher les métriques clés (**Revenus**, **Dépenses**, **Solde**) réunies sur **une seule ligne horizontale compacte** avec badges de couleur, montants lisibles et séparateurs discrets. |
| **D5** | Filtres et sélecteur dans le tiroir | Immédiatement sous les compteurs, intégrer la boîte à outils de filtrage : recherche textuelle, sélection du type, multi-sélection des comptes, tranche de montant, bouton de réinitialisation, ainsi que le sélecteur de date interactif. |
| **D6** | Préservation intégrale du Desktop | Sur écran large (`>= lg`), le tiroir mobile et la barre basse sont masqués (`lg:hidden`). L'interface desktop actuelle (cartes KPI en haut, filtres horizontaux, tableau complet) reste strictement identique. |

---

## 3. Plan d'Action & Découpage

1. **Création du composant dédié ou intégration directe (`app/pages/dashboard/index.vue`) :**
   - Extraire ou intégrer le tiroir mobile avec `UDrawer` de Nuxt UI (`direction="bottom"`).
   - Concevoir la barre d'ancrage basse compacte (`fixed bottom-0 left-0 right-0 z-30`).
   - Implémenter la rangée unique pour les compteurs (Revenus, Dépenses, Solde).
   - Intégrer les filtres et le sélecteur de date dans le corps du tiroir.
2. **Ajustement de l'espace d'affichage du tableau sur mobile :**
   - Ajouter un padding inférieur (`pb-20`) sur le conteneur scrollable des transactions afin que les dernières lignes ne soient pas masquées par la barre basse fermée.
3. **Contrôle et interactions tactiles :**
   - Tester le déclenchement (clic poignée, swipe-up, fermeture swipe-down, backdrop).
4. **Validation de conformité :**
   - Exécution systématique de `npm run lint` et `npm run typecheck`.
   - Audit visuel et gestuel via browser subagent sur viewport mobile standard (390×844).
