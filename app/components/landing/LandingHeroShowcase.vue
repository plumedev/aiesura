<script setup lang="ts">
import {
  mockAccounts,
  mockOverviewTransactions,
  mockSummary,
  mockRules,
  mockSteps
} from '~/utils/landingMockData'
import { formatAmount, formatDate } from '~/utils'
import type { GroupedStep, ChecklistStep, GroupedTransitStep, GroupedDispatchStep, GroupedDirectStep } from '~/types'

type ActiveView = 'overview' | 'flows' | 'accounts'

const activeView = ref<ActiveView>('overview')

const setActiveView = (view: ActiveView) => {
  activeView.value = view
}

// ─── Données d'état Vue d'ensemble ───
const expandedRows = ref<Set<string>>(new Set(['tx-3'])) // Ouvert par défaut pour montrer les itérations

const toggleRow = (id: string) => {
  if (expandedRows.value.has(id)) {
    expandedRows.value.delete(id)
  } else {
    expandedRows.value.add(id)
  }
}

const searchFilter = ref('')
const typeFilter = ref<string | undefined>(undefined)

const filteredTransactions = computed(() => {
  let list = mockOverviewTransactions
  if (searchFilter.value) {
    const q = searchFilter.value.toLowerCase()
    list = list.filter(t => t.name.toLowerCase().includes(q))
  }
  if (typeFilter.value) {
    list = list.filter(t => t.type === typeFilter.value)
  }
  return list
})

// KPI Cards
const kpiCards = computed(() => [
  {
    label: 'Dépenses',
    value: formatAmount(mockSummary.totalExpenses),
    icon: 'i-heroicons-arrow-down-left',
    iconClass: 'text-red-500 dark:text-red-400',
    badgeClass: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
  },
  {
    label: 'Revenus',
    value: formatAmount(mockSummary.totalIncome),
    icon: 'i-heroicons-arrow-up-right',
    iconClass: 'text-green-500 dark:text-green-400',
    badgeClass: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'
  },
  {
    label: 'Solde',
    value: formatAmount(mockSummary.balance, 'income'),
    icon: 'i-heroicons-banknotes',
    iconClass: 'text-blue-500 dark:text-blue-400',
    badgeClass: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'
  }
])

// ─── Données d'état Flux Mensuels ───
const liveSteps = ref<ChecklistStep[]>(JSON.parse(JSON.stringify(mockSteps)))

const handleSaveStep = (step: GroupedStep, completed: boolean) => {
  if (step.id && step.id.startsWith('grouped-transit-')) {
    const transitStep = step as GroupedTransitStep
    liveSteps.value.forEach((s) => {
      if (s.transitName === transitStep.transitName) {
        s.transitCompleted = completed
      }
    })
  } else if (step.id && step.id.startsWith('grouped-dispatch-')) {
    const dispatchStep = step as GroupedDispatchStep
    liveSteps.value.forEach((s) => {
      if (s.destName === dispatchStep.destName) {
        s.completed = completed
      }
    })
  } else if (step.id && step.id.startsWith('grouped-direct-')) {
    const directStep = step as GroupedDirectStep
    liveSteps.value.forEach((s) => {
      if (s.destName === directStep.destName) {
        s.completed = completed
      }
    })
  }
}

const completedStepsCount = computed(() => liveSteps.value.filter(s => s.completed).length)
const totalStepsCount = computed(() => liveSteps.value.length)
const flowProgress = computed(() => Math.round((completedStepsCount.value / totalStepsCount.value) * 100))

const resetSteps = () => {
  liveSteps.value.forEach((s) => {
    s.completed = false
    s.transitCompleted = false
  })
}

const navItems = [
  { id: 'overview' as const, label: 'Vue d\'ensemble', icon: 'i-heroicons-home' },
  { id: 'flows' as const, label: 'Flux Mensuels', icon: 'i-heroicons-chart-bar' },
  { id: 'accounts' as const, label: 'Comptes', icon: 'i-heroicons-building-library' }
]
</script>

<template>
  <div class="relative mx-auto w-full max-w-6xl">
    <!-- Halo lumineux subtil -->
    <div class="absolute -top-10 left-1/2 -translate-x-1/2 w-4/5 h-60 bg-emerald-600/10 dark:bg-emerald-400/5 blur-3xl pointer-events-none rounded-full" />

    <!-- Fenêtre Application Fidèle à Aiesura -->
    <div class="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl bg-white dark:bg-[#0A332C] text-left">
      <!-- Barre d'en-tête Browser / OS -->
      <div class="flex items-center justify-between px-4 py-2.5 border-b border-black/10 dark:border-white/10 bg-gray-100/90 dark:bg-[#0C3C32]/90 backdrop-blur-md">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-[#f2545b]" />
          <div class="w-3 h-3 rounded-full bg-amber-400" />
          <div class="w-3 h-3 rounded-full bg-green-500" />
          <div class="ml-3 hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/70 dark:bg-black/30 border border-black/5 dark:border-white/5 text-[11px] font-mono text-gray-500 dark:text-gray-400">
            <UIcon
              name="i-heroicons-lock-closed"
              class="w-3 h-3 text-emerald-600 dark:text-emerald-400"
            />
            <span>https://aiesura.app/dashboard</span>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Interface réelle interactive
          </span>
        </div>
      </div>

      <!-- Structure de l'application réelle (Sidebar + DashboardPanel) -->
      <div class="flex min-h-[580px] max-h-[680px]">
        <!-- ── Sidebar authentique (style layouts/dashboard.vue) ── -->
        <aside class="w-56 shrink-0 bg-[#DCE8E2] dark:bg-[#0C3C32] border-r border-black/5 dark:border-white/5 flex flex-col justify-between p-3 select-none hidden md:flex">
          <div class="space-y-4">
            <!-- Header sidebar avec Logo réel -->
            <div class="flex items-center gap-2 px-2 py-1">
              <AppLogo class="w-auto h-5 shrink-0 text-[#0A332C] dark:text-emerald-400" />
              <span class="font-bold text-sm text-gray-900 dark:text-white">Aiesura</span>
            </div>

            <!-- Navigation identique à layouts/dashboard.vue -->
            <nav class="space-y-1">
              <button
                v-for="item in navItems"
                :key="item.id"
                type="button"
                :class="[
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer text-left',
                  activeView === item.id
                    ? '!bg-[#0C3C32] text-white dark:!bg-[#0A332C] shadow-sm'
                    : 'text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                ]"
                @click="setActiveView(item.id)"
              >
                <UIcon
                  :name="item.icon"
                  :class="['w-4 h-4 shrink-0', activeView === item.id ? 'text-white' : 'text-gray-500 dark:text-white/70']"
                />
                <span>{{ item.label }}</span>
              </button>
            </nav>
          </div>

          <!-- Footer sidebar : Profil utilisateur authentique -->
          <div class="pt-3 border-t border-black/5 dark:border-white/10 flex items-center gap-2.5 px-2">
            <div class="w-7 h-7 rounded-full bg-[#0A332C] dark:bg-emerald-500 text-white dark:text-[#0A332C] flex items-center justify-center text-xs font-bold shrink-0">
              L
            </div>
            <div class="min-w-0">
              <div class="text-xs font-semibold text-gray-900 dark:text-white truncate">
                Lucas D.
              </div>
              <div class="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                Plan Standard
              </div>
            </div>
          </div>
        </aside>

        <!-- ── Contenu du DashboardPanel authentique ── -->
        <div class="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0A332C] overflow-hidden">
          <!-- Navbar supérieure authentique (UDashboardNavbar) -->
          <div class="h-14 px-4 sm:px-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-white/80 dark:bg-[#0A332C]/80 backdrop-blur-md">
            <div class="flex items-center gap-3">
              <!-- Mobile view switcher -->
              <div class="flex md:hidden items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg text-xs">
                <button
                  v-for="item in navItems"
                  :key="item.id"
                  type="button"
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium cursor-pointer shrink-0',
                    activeView === item.id ? 'bg-[#0A332C] text-white' : 'text-gray-700 dark:text-gray-300'
                  ]"
                  @click="setActiveView(item.id)"
                >
                  <span class="sm:hidden">{{ item.id === 'overview' ? 'Aperçu' : item.id === 'flows' ? 'Flux' : 'Comptes' }}</span>
                  <span class="hidden sm:inline">{{ item.label }}</span>
                </button>
              </div>

              <h2 class="text-base font-bold text-gray-900 dark:text-white hidden md:block">
                {{ navItems.find(n => n.id === activeView)?.label }}
              </h2>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs px-2 sm:px-2.5 py-1 rounded-md bg-[#F1F5F3] dark:bg-[#0C3C32] text-gray-700 dark:text-gray-200 font-medium border border-black/5 dark:border-white/5 whitespace-nowrap">
                📅 Octobre 2026
              </span>
            </div>
          </div>

          <!-- Zone de contenu avec scroll interne -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <!-- ══════════════ VUE 1 : VUE D'ENSEMBLE (FIDÈLE À INDEX.VUE) ══════════════ -->
            <div
              v-if="activeView === 'overview'"
              class="space-y-6"
            >
              <!-- Sélecteur de période -->
              <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span class="mr-2">Période analysée :</span>
                <span class="font-semibold text-gray-900 dark:text-white">01/10/2026 – 31/10/2026</span>
              </div>

              <!-- ── KPI Cards (Identiques à dashboard/index.vue) ── -->
              <div class="grid grid-cols-1 sm:grid-cols-3 rounded-xl overflow-hidden shadow ring-1 ring-gray-200 dark:ring-gray-800 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-800 bg-[#F1F5F3] dark:bg-[#0C3C32]">
                <div
                  v-for="kpi in kpiCards"
                  :key="kpi.label"
                  class="p-4 sm:p-5 flex flex-col gap-2"
                >
                  <div :class="['w-7 h-7 rounded-full flex items-center justify-center border', kpi.badgeClass]">
                    <UIcon
                      :name="kpi.icon"
                      :class="['w-4 h-4', kpi.iconClass]"
                    />
                  </div>
                  <div>
                    <p class="text-[11px] font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                      {{ kpi.label }}
                    </p>
                    <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight mt-0.5">
                      {{ kpi.value }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- ── Filtres (Identiques à dashboard/index.vue) ── -->
              <div class="p-3 rounded-xl bg-[#F1F5F3] dark:bg-[#0C3C32] border border-black/5 dark:border-white/5 flex flex-wrap items-center gap-3">
                <UInput
                  v-model="searchFilter"
                  icon="i-heroicons-magnifying-glass"
                  placeholder="Rechercher une transaction..."
                  size="sm"
                  class="w-full sm:w-60"
                />
                <span class="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                  {{ filteredTransactions.length }} transactions trouvées
                </span>
              </div>

              <!-- ── Tableau des transactions avec sous-lignes d'itérations ── -->
              <div class="rounded-xl overflow-x-auto border border-black/10 dark:border-white/10 bg-[#F1F5F3] dark:bg-[#0C3C32] shadow-sm">
                <table class="w-full text-xs sm:text-sm min-w-[500px]">
                  <thead>
                    <tr class="sticky top-0 z-10 backdrop-blur-md bg-gray-50/90 dark:bg-[#11463B]/90 border-b border-default text-left text-gray-900 dark:text-white font-semibold">
                      <th class="pl-6 pr-4 py-3">
                        Libellé
                      </th>
                      <th class="px-4 py-3">
                        Itérations
                      </th>
                      <th class="px-4 py-3 hidden sm:table-cell">
                        Compte
                      </th>
                      <th class="px-4 py-3">
                        Type
                      </th>
                      <th class="px-4 py-3 text-right">
                        Montant
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-black/5 dark:divide-white/5">
                    <template
                      v-for="tx in filteredTransactions"
                      :key="tx.id"
                    >
                      <!-- Ligne principale -->
                      <tr
                        :class="[
                          'hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors',
                          tx.iterationCount > 1 ? 'cursor-pointer' : ''
                        ]"
                        @click="tx.iterationCount > 1 ? toggleRow(tx.id) : undefined"
                      >
                        <td class="pl-6 pr-4 py-3 font-medium text-gray-900 dark:text-white">
                          <div class="flex items-center gap-2">
                            <UIcon
                              v-if="tx.iterationCount > 1"
                              :name="expandedRows.has(tx.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                              class="w-4 h-4 text-gray-400 shrink-0"
                            />
                            <span>{{ tx.name }}</span>
                          </div>
                        </td>

                        <td class="px-4 py-3">
                          <UBadge
                            v-if="tx.iterationCount > 1"
                            color="neutral"
                            variant="subtle"
                            size="xs"
                          >
                            {{ tx.iterationCount }} itérations
                          </UBadge>
                          <span
                            v-else
                            class="text-xs text-gray-400"
                          >1</span>
                        </td>

                        <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell text-xs">
                          {{ tx.account.name }}
                        </td>

                        <td class="px-4 py-3">
                          <UBadge
                            :color="tx.type === 'income' ? 'success' : 'error'"
                            variant="subtle"
                            size="xs"
                          >
                            {{ tx.type === 'income' ? 'Revenu' : 'Dépense' }}
                          </UBadge>
                        </td>

                        <td class="px-4 py-3 text-right font-semibold tabular-nums">
                          <span :class="tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500'">
                            {{ formatAmount(tx.totalAmount, tx.type) }}
                          </span>
                        </td>
                      </tr>

                      <!-- Sous-lignes d'itérations réelles -->
                      <template v-if="expandedRows.has(tx.id) && tx.iterationCount > 1">
                        <tr
                          v-for="iter in tx.iterations"
                          :key="iter.id"
                          class="bg-black/[0.03] dark:bg-white/[0.04] text-xs"
                        >
                          <td class="pl-12 py-2 pr-4 text-gray-600 dark:text-gray-300">
                            <div class="flex items-center gap-2">
                              <span>{{ iter.name }}</span>
                              <UBadge
                                v-if="iter.isModified"
                                color="warning"
                                variant="subtle"
                                size="xs"
                              >
                                Modifiée
                              </UBadge>
                            </div>
                            <span class="text-[10px] text-gray-400">
                              {{ formatDate(iter.executionDate) }}
                            </span>
                          </td>

                          <td class="px-4 py-2 text-gray-400 text-[10px]">
                            Itération #{{ iter.id.slice(-1) }}
                          </td>

                          <td class="px-4 py-2 text-gray-400 text-[10px] hidden sm:table-cell">
                            {{ tx.account.name }}
                          </td>

                          <td class="px-4 py-2">
                            <UBadge
                              :color="iter.type === 'income' ? 'success' : 'error'"
                              variant="subtle"
                              size="xs"
                            >
                              {{ iter.type === 'income' ? 'Revenu' : 'Dépense' }}
                            </UBadge>
                          </td>

                          <td class="px-4 py-2 text-right font-medium text-gray-700 dark:text-gray-200 tabular-nums">
                            {{ formatAmount(iter.amount, iter.type) }}
                          </td>
                        </tr>
                      </template>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ══════════════ VUE 2 : FLUX MENSUELS (FIDÈLE À FLOWS.VUE) ══════════════ -->
            <div
              v-else-if="activeView === 'flows'"
              class="space-y-6"
            >
              <!-- 2 Colonnes d'en-tête de planification -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <!-- Période & Action -->
                <div class="p-4 rounded-xl bg-[#F1F5F3] dark:bg-[#0C3C32] border border-black/10 dark:border-white/10 space-y-3">
                  <div class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Période de planification
                  </div>
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">
                    Octobre 2026
                  </div>
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-gray-500 dark:text-gray-400">Progression des virements</span>
                      <span class="font-bold text-gray-900 dark:text-white">{{ flowProgress }}%</span>
                    </div>
                    <div class="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-green-500 rounded-full transition-all duration-300"
                        :style="{ width: `${flowProgress}%` }"
                      />
                    </div>
                  </div>
                </div>

                <!-- Revenus de planification -->
                <div class="lg:col-span-2 p-4 rounded-xl bg-[#F1F5F3] dark:bg-[#0C3C32] border border-black/10 dark:border-white/10 flex flex-col justify-between gap-2">
                  <div class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex justify-between">
                    <span>Revenus de planification</span>
                    <span class="text-gray-900 dark:text-white font-bold">Total : 3 500,00 €</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      variant="soft"
                      color="neutral"
                      class="text-xs"
                    >
                      Salaire CDI Tech (3 200,00 €)
                    </UBadge>
                    <UBadge
                      variant="soft"
                      color="neutral"
                      class="text-xs"
                    >
                      Prime trimestrielle (300,00 €)
                    </UBadge>
                  </div>
                </div>
              </div>

              <!-- Modèle de flux visuel réel (FlowsFlowDiagram) -->
              <FlowsFlowDiagram
                :rules="mockRules"
                :steps="liveSteps"
              />

              <!-- Checklist réelle (FlowsTodoList) -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                    Checklist mensuelle interactive
                  </h3>
                  <button
                    type="button"
                    class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    @click="resetSteps"
                  >
                    Réinitialiser les coches
                  </button>
                </div>
                <FlowsTodoList
                  :steps="liveSteps"
                  @save-step="handleSaveStep"
                />
              </div>
            </div>

            <!-- ══════════════ VUE 3 : COMPTES (FIDÈLE À ACCOUNTS.VUE) ══════════════ -->
            <div
              v-else
              class="space-y-6"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider font-mono">
                  Comptes bancaires & Trésorerie
                </h3>
                <UBadge
                  color="primary"
                  variant="subtle"
                  size="sm"
                >
                  {{ mockAccounts.length }} comptes actifs
                </UBadge>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="acc in mockAccounts"
                  :key="acc.id"
                  class="p-5 rounded-xl bg-[#F1F5F3] dark:bg-[#0C3C32] border border-black/10 dark:border-white/10 space-y-3"
                >
                  <div class="flex items-center justify-between">
                    <div class="w-9 h-9 rounded-lg bg-white/80 dark:bg-black/20 flex items-center justify-center text-[#0A332C] dark:text-emerald-400">
                      <UIcon
                        :name="acc.icon"
                        class="w-5 h-5"
                      />
                    </div>
                    <UBadge
                      v-if="acc.isMain"
                      color="primary"
                      variant="solid"
                      size="xs"
                    >
                      Principal
                    </UBadge>
                  </div>

                  <div>
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ acc.name }}
                    </div>
                    <div class="text-xl font-bold text-gray-900 dark:text-white tabular-nums mt-1">
                      {{ formatAmount(acc.balance) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
