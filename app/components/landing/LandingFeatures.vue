<script setup lang="ts">
import { ref, computed } from 'vue'

const activeFeature = ref(0)

const features = [
  {
    icon: 'i-lucide-calendar-range',
    title: 'Itérations de dépenses',
    badge: 'Fonction clé',
    subtitle: 'Ajuster un mois sans casser la suite',
    description: 'Chaque dépense récurrente génère des itérations mensuelles. Si une facture varie un mois donné, ajustez seulement son itération.',
    details: [
      'Modification du montant ou de la date pour un mois précis',
      'Préservation automatique des règles des mois suivants',
      'Visualisation immédiate de l’impact sur le solde mensuel'
    ],
    accentColor: 'from-emerald-500/20 to-teal-500/10',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  },
  {
    icon: 'i-lucide-git-merge',
    title: 'Planificateur de règles de flux',
    badge: 'Calcul automatique',
    subtitle: 'Ventilation calculée de vos revenus',
    description: 'Paramétrez vos règles (ex: 20% vers l’épargne, 250 € vers un projet). L’outil calcule les montants exacts selon votre revenu.',
    details: [
      'Règles en pourcentage ou en montants fixes',
      'Support des comptes intermédiaires (transit)',
      'Schéma visuel des virements à planifier'
    ],
    accentColor: 'from-teal-500/20 to-cyan-500/10',
    iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
  },
  {
    icon: 'i-lucide-check-check',
    title: 'Checklist mensuelle de virements',
    badge: 'Organisation',
    subtitle: 'Votre guide le 1er du mois',
    description: 'Retrouvez la liste ordonnée des virements à faire sur votre banque. Cochez-les au fur et à mesure de leur exécution.',
    details: [
      'Regroupement des virements vers un même compte destinataire',
      'Barre de progression en direct',
      'Statut conservé pour chaque mois'
    ],
    accentColor: 'from-green-500/20 to-emerald-500/10',
    iconBg: 'bg-green-500/10 text-green-600 dark:text-green-400'
  },
  {
    icon: 'i-lucide-wallet-cards',
    title: 'Gestion multi-comptes',
    badge: 'Visibilité',
    subtitle: 'Comptes courants, livrets et épargne',
    description: 'Organisez vos finances par comptes pour savoir exactement d’où part et où arrive chaque euro.',
    details: [
      'Attribution de chaque dépense et revenu à un compte précis',
      'Filtre par compte dans le tableau de bord',
      'Identification des flux entre vos propres comptes'
    ],
    accentColor: 'from-amber-500/20 to-emerald-500/10',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Base PostgreSQL privée',
    badge: 'Sécurité',
    subtitle: 'Vos données restent les vôtres',
    description: 'Vos transactions et règles sont protégées par authentification Supabase et des règles RLS strictes.',
    details: [
      'Chaque utilisateur n’a accès qu’à ses propres enregistrements',
      'Pas de revente de données ni d’accès API bancaire intrusif',
      'Base de données hébergée et sauvegardée'
    ],
    accentColor: 'from-blue-500/20 to-indigo-500/10',
    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
  },
  {
    icon: 'i-lucide-moon-star',
    title: 'Interface sobre & Mode sombre',
    badge: 'Confort',
    subtitle: 'Palette vert forêt reposante',
    description: 'Une application pensée pour être claire et lisible, de jour comme de nuit, sans éléments superflus.',
    details: [
      'Thème sombre soigné (#0A332C / #0C3C32)',
      'Tableaux rapides et filtres instantanés',
      'Composants Nuxt UI légers et fluides'
    ],
    accentColor: 'from-emerald-500/20 to-teal-500/10',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  }
]

const selectFeature = (idx: number) => {
  activeFeature.value = idx
}

const currentFeature = computed(() => features[activeFeature.value] ?? features[0]!)
</script>

<template>
  <div class="space-y-10">
    <!-- En-tête de section -->
    <div class="text-center max-w-2xl mx-auto space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#0A332C]/10 dark:bg-white/10 text-[#0A332C] dark:text-emerald-300">
        <UIcon
          name="i-lucide-layers"
          class="w-3.5 h-3.5"
        />
        <span>Fonctionnalités réelles</span>
      </div>
      <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
        Ce que fait concrètement l'application
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Une structure claire articulée autour de 6 fonctionnalités précises, sans artifice.
      </p>
    </div>

    <!-- Bento Grid Interactive & Interactive Feature Focus -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      <!-- Colonne de gauche : Cartes Bento avec interactions de survol et sélection -->
      <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="(feat, idx) in features"
          :key="feat.title"
          class="group relative p-5 rounded-2xl bg-[#F1F5F3] dark:bg-[#0C3C32] border cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden"
          :class="[
            activeFeature === idx
              ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 shadow-md bg-white dark:bg-[#0F5040]'
              : 'hover:shadow-sm hover:bg-white/80 dark:hover:bg-[#0E4439]'
          ]"
          @click="selectFeature(idx)"
        >
          <div class="space-y-3 relative z-10">
            <div class="flex items-center justify-between">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center"
                :class="feat.iconBg"
              >
                <UIcon
                  :name="feat.icon"
                  class="w-4 h-4"
                />
              </div>
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                :class="activeFeature === idx ? 'bg-emerald-600 text-white' : 'bg-white/80 dark:bg-black/30 text-gray-600 dark:text-gray-300'"
              >
                {{ feat.badge }}
              </span>
            </div>

            <div>
              <h4 class="text-sm font-bold text-gray-900 dark:text-white">
                {{ feat.title }}
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {{ feat.description }}
              </p>
            </div>
          </div>

          <!-- Indicateur d'action interactif -->
          <div class="pt-3 mt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            <span>{{ activeFeature === idx ? 'Sélectionné' : 'Voir le détail' }}</span>
            <UIcon
              name="i-lucide-arrow-right"
              class="w-3.5 h-3.5 transition-transform"
              :class="activeFeature === idx ? 'translate-x-1' : 'group-hover:translate-x-1'"
            />
          </div>
        </div>
      </div>

      <!-- Colonne de droite : Panneau de focus interactif dynamique (Bento Hero Feature) -->
      <div class="lg:col-span-5 rounded-3xl bg-[#F1F5F3] dark:bg-[#0C3C32] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden shadow-lg border">
        <div class="space-y-5 relative z-10">
          <div class="flex items-center justify-between">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <UIcon
                :name="currentFeature.icon"
                class="w-4 h-4"
              />
              <span>Détail #0{{ activeFeature + 1 }}</span>
            </div>
            <span class="text-xs font-bold text-gray-400 font-mono">
              0{{ activeFeature + 1 }} / 0{{ features.length }}
            </span>
          </div>

          <div>
            <h4 class="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {{ currentFeature.title }}
            </h4>
            <p class="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1 uppercase tracking-wider">
              {{ currentFeature.subtitle }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-2.5 leading-relaxed">
              {{ currentFeature.description }}
            </p>
          </div>

          <!-- Points clés détaillés -->
          <div class="space-y-2 pt-1">
            <p class="text-xs font-bold uppercase tracking-wider text-gray-400">
              Fonctionnement précis :
            </p>
            <div
              v-for="(detail, dIdx) in currentFeature.details"
              :key="dIdx"
              class="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-black/20 p-2.5 rounded-xl"
            >
              <UIcon
                name="i-lucide-check-circle-2"
                class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <span>{{ detail }}</span>
            </div>
          </div>
        </div>

        <!-- Navigation interactive entre fonctionnalités -->
        <div class="pt-5 mt-5 border-t border-black/5 dark:border-white/10 flex items-center justify-between relative z-10">
          <button
            type="button"
            class="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/80 dark:bg-black/30 hover:bg-white text-gray-700 dark:text-gray-200 transition-all cursor-pointer flex items-center gap-1.5"
            @click="selectFeature((activeFeature - 1 + features.length) % features.length)"
          >
            <UIcon
              name="i-lucide-chevron-left"
              class="w-3.5 h-3.5"
            />
            <span>Précédent</span>
          </button>

          <div class="flex items-center gap-1.5">
            <button
              v-for="(_, dotIdx) in features"
              :key="dotIdx"
              type="button"
              class="w-2.5 h-2.5 rounded-full transition-all cursor-pointer"
              :class="activeFeature === dotIdx ? 'w-5 bg-emerald-600 dark:bg-emerald-400' : 'bg-gray-300 dark:bg-gray-600'"
              @click="selectFeature(dotIdx)"
            />
          </div>

          <button
            type="button"
            class="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            @click="selectFeature((activeFeature + 1) % features.length)"
          >
            <span>Suivant</span>
            <UIcon
              name="i-lucide-chevron-right"
              class="w-3.5 h-3.5"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
