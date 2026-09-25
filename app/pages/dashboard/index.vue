<script setup lang="ts">
import { useIntersectionObserver, useLocalStorage, useSwipe } from '@vueuse/core'
import { OwlDatePicker } from 'vue-owldate'
import type { TransactionIteration } from '~/types/overview'

definePageMeta({ layout: 'dashboard' })

// Composable central
const {
  dateRange,
  filters,
  summary,
  summaryPending,
  items,
  txPending,
  hasMore,
  loadMore,
  refreshAll,
  formatAmount
} = useOverview()

// Choix du composant sélecteur de date (persiste dans le localStorage)
const useOwlDatePicker = useLocalStorage('use-owl-date-picker', true)

const toggleDatePicker = () => {
  useOwlDatePicker.value = !useOwlDatePicker.value
}

// Comptes disponibles pour le filtre multiselect
const { data: accounts } = await useFetch<Array<{ id: string, name: string }>>('/api/accounts')
const accountOptions = computed(() =>
  (accounts.value ?? []).map(a => ({ label: a.name, value: a.id }))
)

const typeFilterOptions = [
  { label: 'Revenus', value: 'income' },
  { label: 'Dépenses', value: 'expense' }
]

const amountRangeOptions = [
  { label: 'Petit (< 50 €)', value: 'small' },
  { label: 'Moyen (50 – 500 €)', value: 'medium' },
  { label: 'Gros (> 500 €)', value: 'large' }
]

// --- Lignes dépliables ---
const expandedRows = ref<Set<string>>(new Set())

const toggleRow = (id: string) => {
  if (expandedRows.value.has(id)) {
    expandedRows.value.delete(id)
  } else {
    expandedRows.value.add(id)
  }
}

// --- Modale d'édition ---
const editingIteration = ref<TransactionIteration | null>(null)

const openEditModal = (iteration: TransactionIteration) => {
  editingIteration.value = iteration
}

const closeEditModal = () => {
  editingIteration.value = null
}

const handleEditSuccess = async () => {
  editingIteration.value = null
  await refreshAll()
}

// --- Modale de transaction ponctuelle ---
const isOneTimeModalOpen = ref(false)

const openOneTimeModal = () => {
  isOneTimeModalOpen.value = true
}

const closeOneTimeModal = () => {
  isOneTimeModalOpen.value = false
}

const handleOneTimeSuccess = async () => {
  isOneTimeModalOpen.value = false
  await refreshAll()
}

const toast = useToast()

const resetIteration = async (id: string) => {
  try {
    await $fetch(`/api/overview/iterations/${id}/reset`, {
      method: 'POST'
    })
    toast.add({
      title: 'Itération réinitialisée',
      description: 'L\'itération a repris les valeurs de sa transaction parente.',
      color: 'success'
    })
    await refreshAll()
  } catch {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de réinitialiser l\'itération.',
      color: 'error'
    })
  }
}

// --- Swipe mobile des transactions ---
const activeMobileSwipeId = ref<string | null>(null)

const handleEditMobileIteration = (iter: TransactionIteration) => {
  activeMobileSwipeId.value = null
  openEditModal(iter)
}

const handleResetMobileIteration = async (id: string) => {
  activeMobileSwipeId.value = null
  await resetIteration(id)
}

// --- Scroll infini : sentinelle ---
const sentinel = ref<HTMLElement | null>(null)

useIntersectionObserver(
  sentinel,
  ([entry]) => {
    if (entry?.isIntersecting) {
      loadMore()
    }
  },
  { threshold: 0.1 }
)

// Chargement initial uniquement côté client (cookies d'auth disponibles seulement en navigateur)
onMounted(async () => {
  await refreshAll()
})

// --- Helpers d'affichage ---
// formatDate est auto-importé depuis ~/utils

const kpiCards = computed(() => [
  {
    label: 'Dépenses',
    value: formatAmount(summary.value.totalExpenses),
    icon: 'i-heroicons-arrow-down-left',
    iconClass: 'text-red-500 dark:text-red-400',
    badgeClass: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
  },
  {
    label: 'Revenus',
    value: formatAmount(summary.value.totalIncome),
    icon: 'i-heroicons-arrow-up-right',
    iconClass: 'text-green-500 dark:text-green-400',
    badgeClass: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'
  },
  {
    label: 'Solde',
    value: formatAmount(summary.value.balance, summary.value.balance >= 0 ? 'income' : 'expense'),
    icon: 'i-heroicons-banknotes',
    iconClass: summary.value.balance >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-red-500 dark:text-red-400',
    badgeClass: summary.value.balance >= 0
      ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'
      : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
  }
])

const getIterationDropdown = (iteration: TransactionIteration) => {
  const items = [
    {
      label: 'Modifier',
      icon: 'i-heroicons-pencil-square',
      onSelect: () => openEditModal(iteration)
    }
  ]

  if (iteration.isModified) {
    items.push({
      label: 'Réinitialiser',
      icon: 'i-heroicons-arrow-path',
      onSelect: () => resetIteration(iteration.id)
    })
  }

  return [items]
}

const hasFilters = computed(() =>
  filters.search || filters.type || filters.accountIds.length > 0 || filters.amountRange
)

const clearFilters = () => {
  filters.search = ''
  filters.type = undefined
  filters.accountIds = []
  filters.amountRange = undefined
}

// --- Tiroir mobile (Bottom Sheet) ---
const isMobileDrawerOpen = ref(false)
const bottomBarRef = ref<HTMLElement | null>(null)

const openMobileDrawer = () => {
  isMobileDrawerOpen.value = true
}

const closeMobileDrawer = () => {
  isMobileDrawerOpen.value = false
}

useSwipe(bottomBarRef, {
  onSwipeEnd: (_e, direction) => {
    if (direction === 'up') {
      openMobileDrawer()
    }
  }
})

const formattedCurrentPeriod = computed(() => {
  if (!dateRange.value?.start || !dateRange.value?.end) return 'Période analysée'
  const start = new Date(dateRange.value.start)
  const end = new Date(dateRange.value.end)
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    const month = start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    return month.charAt(0).toUpperCase() + month.slice(1)
  }
  const s = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  const e = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${s} – ${e}`
})
</script>

<template>
  <UDashboardPanel id="overview">
    <UDashboardNavbar title="Vue d'ensemble">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
      <template #right>
        <div class="flex items-center gap-2">
          <UButton
            icon="i-heroicons-plus"
            color="primary"
            variant="solid"
            size="sm"
            class="cursor-pointer font-medium"
            @click="openOneTimeModal"
          >
            <span class="hidden sm:inline">Transaction ponctuelle</span>
            <span class="sm:hidden">Ajouter</span>
          </UButton>
          <UButton
            :icon="useOwlDatePicker ? 'i-heroicons-calendar' : 'i-heroicons-adjustments-horizontal'"
            :title="useOwlDatePicker ? 'Passer au sélecteur Slider' : 'Passer au sélecteur standard'"
            color="neutral"
            variant="ghost"
            size="xs"
            class="rounded-md"
            @click="toggleDatePicker"
          >
            <span class="hidden md:inline">{{ useOwlDatePicker ? 'Sélecteur standard' : 'Sélecteur Slider' }}</span>
          </UButton>
        </div>
      </template>
    </UDashboardNavbar>

    <div class="flex flex-col gap-6 p-4 h-full overflow-y-auto lg:overflow-hidden pb-28 lg:pb-4">
      <!-- ── Sélecteur de période (Desktop) ── -->
      <div class="hidden lg:flex flex-col sm:flex-row sm:items-center gap-2">
        <p class="text-sm mr-2 text-gray-500 dark:text-gray-400 shrink-0">
          Période analysée
        </p>
        <div class="overflow-x-auto max-w-full">
          <ClientOnly>
            <OwlDatePicker
              v-if="useOwlDatePicker"
              v-model="dateRange"
            />
            <OverviewDateRangePicker
              v-else
              :model-value="dateRange"
              @update:model-value="dateRange = $event"
            />
          </ClientOnly>
        </div>
      </div>

      <!-- ── KPI Cards (Desktop) ── -->
      <div class="hidden lg:grid grid-cols-1 sm:grid-cols-3 rounded-xl overflow-hidden shadow ring-1 ring-gray-200 dark:ring-gray-800 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-800 bg-[#F1F5F3] dark:bg-[#0C3C32]">
        <div
          v-for="kpi in kpiCards"
          :key="kpi.label"
          class="p-3.5 sm:p-6 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3"
        >
          <div class="flex items-center sm:items-start gap-2.5 sm:gap-3">
            <!-- Icon Badge -->
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center border shrink-0', kpi.badgeClass]">
              <UIcon
                :name="kpi.icon"
                :class="['w-4 h-4', kpi.iconClass]"
              />
            </div>

            <div class="flex flex-col gap-0.5">
              <p class="text-[11px] font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                {{ kpi.label }}
              </p>
            </div>
          </div>

          <div>
            <p
              v-if="summaryPending"
              class="h-7 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"
            />
            <p
              v-else
              class="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
            >
              {{ kpi.value }}
            </p>
          </div>
        </div>
      </div>

      <!-- ── Filtres (Desktop) ── -->
      <UCard class="hidden lg:block">
        <div class="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
          <!-- Recherche -->
          <UInput
            v-model="filters.search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Rechercher une transaction..."
            class="w-full sm:w-60"
          />

          <!-- Type -->
          <USelectMenu
            v-model="filters.type"
            :items="typeFilterOptions"
            value-key="value"
            label-key="label"
            placeholder="Tous les types"
            class="w-full sm:w-44"
          />

          <!-- Comptes (multiselect) -->
          <USelectMenu
            v-model="filters.accountIds"
            :items="accountOptions"
            value-key="value"
            label-key="label"
            multiple
            placeholder="Tous les comptes"
            class="w-full sm:w-48"
          />

          <!-- Montant -->
          <USelectMenu
            v-model="filters.amountRange"
            :items="amountRangeOptions"
            value-key="value"
            label-key="label"
            placeholder="Tous les montants"
            class="w-full sm:w-48"
          />

          <!-- Réinitialiser -->
          <UButton
            v-if="hasFilters"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-x-mark"
            size="sm"
            @click="clearFilters"
          >
            Réinitialiser
          </UButton>
        </div>
      </UCard>

      <!-- ── Tableau des transactions ── -->
      <UCard
        class="flex-1 min-h-0 flex flex-col"
        :ui="{
          root: 'flex flex-col h-full',
          body: 'p-0 sm:p-0 flex-1 min-h-0 overflow-y-auto'
        }"
      >
        <div
          v-if="txPending && items.length === 0"
          class="p-8 text-center text-muted"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-6 h-6 animate-spin mx-auto mb-2"
          />
          Chargement…
        </div>

        <div
          v-else-if="items.length === 0"
          class="p-8 text-center text-muted"
        >
          <UIcon
            name="i-heroicons-inbox"
            class="w-8 h-8 mx-auto mb-2 opacity-40"
          />
          <p>Aucune transaction sur cette période.</p>
        </div>

        <div
          v-else
          class="flex-1 flex flex-col min-h-0"
        >
          <!-- ── VUE MOBILE : Liste de cartes swipeables (< lg) ── -->
          <div class="block lg:hidden p-3 space-y-2.5">
            <template
              v-for="tx in items"
              :key="tx.id"
            >
              <!-- Ligne principale de la transaction -->
              <TransactionsMobileSwipeableRow
                :id="tx.id"
                v-model:active-id="activeMobileSwipeId"
                :actions-width="tx.iterationCount === 1 ? (tx.iterations?.[0]?.isModified ? 116 : 60) : 0"
                :disabled="tx.iterationCount > 1"
                @click="tx.iterationCount > 1 ? toggleRow(tx.id) : undefined"
              >
                <div class="flex items-center gap-3 p-3">
                  <!-- 1. Icône Dépense / Revenu -->
                  <div
                    :class="[
                      'w-9 h-9 rounded-full flex items-center justify-center shrink-0 border',
                      tx.type === 'income'
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    ]"
                  >
                    <UIcon
                      :name="tx.type === 'income' ? 'i-heroicons-arrow-up-right' : 'i-heroicons-arrow-down-left'"
                      class="w-4 h-4"
                    />
                  </div>

                  <!-- 2. Centre : Nom + [Compte & Itérations] -->
                  <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div class="flex items-center gap-1.5">
                      <span class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ tx.name }}
                      </span>
                      <UBadge
                        v-if="tx.iterationCount === 1 && tx.iterations?.[0]?.isModified"
                        color="warning"
                        variant="subtle"
                        size="xs"
                      >
                        Modifiée
                      </UBadge>
                    </div>

                    <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span class="truncate">
                        {{ tx.account.name }}
                      </span>

                      <span>•</span>

                      <span
                        v-if="tx.iterations?.[0]?.executionDate"
                        class="shrink-0 text-[11px] text-gray-400"
                      >
                        {{ formatDate(tx.iterations[0].executionDate) }}
                      </span>

                      <span
                        v-if="tx.iterationCount > 1"
                        class="shrink-0 flex items-center gap-1 text-[11px] font-medium text-gray-600 dark:text-gray-300 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded"
                      >
                        {{ tx.iterationCount }} fois
                        <UIcon
                          :name="expandedRows.has(tx.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                          class="w-3 h-3 text-muted transition-transform"
                        />
                      </span>
                    </div>
                  </div>

                  <!-- 3. Montant à droite -->
                  <div class="text-right shrink-0">
                    <span
                      :class="[
                        'text-sm font-semibold whitespace-nowrap',
                        tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                      ]"
                    >
                      {{ formatAmount(tx.totalAmount, tx.type) }}
                    </span>
                  </div>
                </div>

                <!-- Actions au swipe pour transaction simple (1 itération) -->
                <template
                  v-if="tx.iterationCount === 1 && tx.iterations?.[0]"
                  #actions
                >
                  <button
                    v-if="tx.iterations[0].isModified"
                    type="button"
                    class="w-12 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-95 transition-transform cursor-pointer"
                    title="Réinitialiser l'itération"
                    @click.stop="handleResetMobileIteration(tx.iterations[0].id)"
                  >
                    <UIcon
                      name="i-heroicons-arrow-path"
                      class="w-4 h-4"
                    />
                    <span class="text-[10px] font-medium leading-tight">Réinit.</span>
                  </button>

                  <button
                    type="button"
                    class="w-12 h-12 rounded-xl bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-800 dark:text-gray-100 border border-black/5 dark:border-white/10 flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-95 transition-transform cursor-pointer"
                    title="Modifier l'itération"
                    @click.stop="handleEditMobileIteration(tx.iterations[0])"
                  >
                    <UIcon
                      name="i-heroicons-pencil-square"
                      class="w-4 h-4"
                    />
                    <span class="text-[10px] font-medium leading-tight">Modifier</span>
                  </button>
                </template>
              </TransactionsMobileSwipeableRow>

              <!-- Sous-lignes pour les itérations multiples quand dépliées -->
              <div
                v-if="expandedRows.has(tx.id) && tx.iterationCount > 1"
                class="pl-3.5 pr-0.5 py-1 space-y-1.5 border-l-2 border-primary-500/30 ml-4 my-1"
              >
                <TransactionsMobileSwipeableRow
                  v-for="iter in tx.iterations"
                  :id="iter.id"
                  :key="iter.id"
                  v-model:active-id="activeMobileSwipeId"
                  :actions-width="iter.isModified ? 116 : 60"
                >
                  <div class="flex items-center gap-2.5 p-2.5">
                    <div
                      class="w-2 h-2 rounded-full shrink-0"
                      :class="iter.type === 'income' ? 'bg-green-500' : 'bg-red-500'"
                    />

                    <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                          {{ iter.name }}
                        </span>
                        <UBadge
                          v-if="iter.isModified"
                          color="warning"
                          variant="subtle"
                          size="xs"
                        >
                          Modifiée
                        </UBadge>
                      </div>
                      <span class="text-[11px] text-gray-400">
                        {{ formatDate(iter.executionDate) }}
                      </span>
                    </div>

                    <div class="text-right shrink-0">
                      <span
                        :class="[
                          'text-xs font-semibold whitespace-nowrap',
                          iter.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                        ]"
                      >
                        {{ formatAmount(iter.amount, iter.type) }}
                      </span>
                    </div>
                  </div>

                  <template #actions>
                    <button
                      v-if="iter.isModified"
                      type="button"
                      class="w-12 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-95 transition-transform cursor-pointer"
                      title="Réinitialiser l'itération"
                      @click.stop="handleResetMobileIteration(iter.id)"
                    >
                      <UIcon
                        name="i-heroicons-arrow-path"
                        class="w-4 h-4"
                      />
                      <span class="text-[10px] font-medium leading-tight">Réinit.</span>
                    </button>

                    <button
                      type="button"
                      class="w-12 h-12 rounded-xl bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-800 dark:text-gray-100 border border-black/5 dark:border-white/10 flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-95 transition-transform cursor-pointer"
                      title="Modifier l'itération"
                      @click.stop="handleEditMobileIteration(iter)"
                    >
                      <UIcon
                        name="i-heroicons-pencil-square"
                        class="w-4 h-4"
                      />
                      <span class="text-[10px] font-medium leading-tight">Modifier</span>
                    </button>
                  </template>
                </TransactionsMobileSwipeableRow>
              </div>
            </template>
          </div>

          <!-- ── VUE DESKTOP : Tableau complet (>= lg) ── -->
          <div class="hidden lg:block overflow-x-auto w-full">
            <table class="w-full text-sm min-w-[620px]">
              <thead>
                <tr class="sticky top-0 z-10 backdrop-blur-md bg-gray-50/90 dark:bg-[#11463B]/90 border-b border-default text-left text-gray-900 dark:text-white">
                  <th class="pl-6 pr-4 py-3 font-semibold">
                    Libellé
                  </th>
                  <th class="px-4 py-3 font-semibold">
                    Itérations
                  </th>
                  <th class="px-4 py-3 font-semibold">
                    Compte
                  </th>
                  <th class="px-4 py-3 font-semibold">
                    Type
                  </th>
                  <th class="px-4 py-3 font-semibold text-right">
                    Montant total
                  </th>
                  <th class="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                <template
                  v-for="tx in items"
                  :key="tx.id"
                >
                  <!-- Ligne principale -->
                  <tr
                    class="border-b border-default hover:bg-elevated/30 transition-colors"
                    :class="{ 'cursor-pointer': tx.iterationCount > 1 }"
                    @click="tx.iterationCount > 1 ? toggleRow(tx.id) : undefined"
                  >
                    <!-- Libellé avec Toggle -->
                    <td class="pl-6 pr-4 py-3 font-medium">
                      <div class="flex items-center relative">
                        <UIcon
                          v-if="tx.iterationCount > 1"
                          :name="expandedRows.has(tx.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                          class="absolute -left-5 w-4 h-4 text-muted transition-transform"
                        />
                        <span>{{ tx.name }}</span>
                      </div>
                    </td>

                    <!-- Itérations badge -->
                    <td class="px-4 py-3">
                      <UBadge
                        v-if="tx.iterationCount > 1"
                        color="neutral"
                        variant="subtle"
                        size="sm"
                      >
                        {{ tx.iterationCount }} fois
                      </UBadge>
                    </td>

                    <!-- Compte -->
                    <td class="px-4 py-3 text-muted">
                      {{ tx.account.name }}
                    </td>

                    <!-- Type -->
                    <td class="px-4 py-3">
                      <UBadge
                        :color="tx.type === 'income' ? 'success' : 'error'"
                        variant="subtle"
                        size="sm"
                      >
                        {{ tx.type === 'income' ? 'Revenu' : 'Dépense' }}
                      </UBadge>
                    </td>

                    <!-- Montant -->
                    <td class="px-4 py-3 text-right font-semibold">
                      <span :class="tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500'">
                        {{ formatAmount(tx.totalAmount, tx.type) }}
                      </span>
                    </td>

                    <!-- Actions -->
                    <td
                      class="px-4 py-3"
                      @click.stop
                    >
                      <UDropdownMenu
                        v-if="tx.iterationCount === 1"
                        :items="getIterationDropdown(tx.iterations[0]!)"
                      >
                        <UButton
                          color="neutral"
                          variant="ghost"
                          icon="i-heroicons-ellipsis-horizontal"
                          size="xs"
                        />
                      </UDropdownMenu>
                    </td>
                  </tr>

                  <!-- Sous-lignes d'itérations (dépliables) -->
                  <template v-if="expandedRows.has(tx.id) && tx.iterationCount > 1">
                    <tr
                      v-for="iter in tx.iterations"
                      :key="iter.id"
                      class="border-b border-default bg-elevated/20"
                    >
                      <!-- Colonne 1: Libellé (aligné avec un padding gauche) -->
                      <td class="pl-10 py-2 pr-4 text-muted">
                        {{ iter.name }}
                        <UBadge
                          v-if="iter.isModified"
                          color="warning"
                          variant="subtle"
                          size="xs"
                          class="ml-1"
                        >
                          Modifiée
                        </UBadge>
                        <span class="text-xs ml-2 text-muted/70">
                          {{ formatDate(iter.executionDate) }}
                        </span>
                      </td>
                      <!-- Colonne 2: Itérations -->
                      <td class="px-4 py-2" />
                      <!-- Colonne 3: Compte -->
                      <td class="px-4 py-2" />
                      <td class="px-4 py-2">
                        <UBadge
                          :color="iter.type === 'income' ? 'success' : 'error'"
                          variant="subtle"
                          size="xs"
                        >
                          {{ iter.type === 'income' ? 'Revenu' : 'Dépense' }}
                        </UBadge>
                      </td>
                      <td class="px-4 py-2 text-right text-sm">
                        <span :class="iter.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500'">
                          {{ formatAmount(iter.amount, iter.type) }}
                        </span>
                      </td>
                      <td
                        class="px-4 py-2"
                        @click.stop
                      >
                        <UDropdownMenu :items="getIterationDropdown(iter)">
                          <UButton
                            color="neutral"
                            variant="ghost"
                            icon="i-heroicons-ellipsis-horizontal"
                            size="xs"
                          />
                        </UDropdownMenu>
                      </td>
                    </tr>
                  </template>
                </template>
              </tbody>
            </table>
          </div>

          <!-- Sentinelle scroll infini -->
          <div
            ref="sentinel"
            class="py-4 text-center"
          >
            <UIcon
              v-if="txPending"
              name="i-heroicons-arrow-path"
              class="w-5 h-5 animate-spin text-muted mx-auto"
            />
            <p
              v-else-if="!hasMore && items.length > 0"
              class="text-xs text-muted"
            >
              Toutes les transactions sont affichées.
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- ── BARRE INFÉRIEURE MOBILE D'ANCRAGE (Bottom Sheet Trigger) ── -->
    <div
      ref="bottomBarRef"
      class="fixed bottom-0 inset-x-0 z-20 lg:hidden border-t border-black/10 dark:border-white/10 bg-[#F1F5F3] dark:bg-[#0C3C32] shadow-2xl transition-all select-none"
    >
      <!-- Poignée tactile incitant au clic / swipe up -->
      <button
        type="button"
        class="w-full pt-2.5 pb-1 flex flex-col items-center justify-center cursor-pointer group"
        aria-label="Ouvrir les filtres et indicateurs"
        @click="openMobileDrawer"
      >
        <span class="w-12 h-1 bg-gray-400/60 dark:bg-gray-500/60 group-hover:bg-gray-600 dark:group-hover:bg-gray-300 rounded-full transition-colors" />
      </button>

      <!-- Contenu de la barre fermée : Période analysée & badge de filtres -->
      <div
        class="px-4 pb-3 flex items-center justify-between gap-3 cursor-pointer"
        @click="openMobileDrawer"
      >
        <!-- Période actuelle condensée -->
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-full bg-[#0A332C]/10 dark:bg-white/10 flex items-center justify-center shrink-0">
            <UIcon
              name="i-heroicons-calendar"
              class="w-4 h-4 text-[#0A332C] dark:text-emerald-400"
            />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider">Période analysée</span>
            <span class="text-xs font-bold text-gray-900 dark:text-white truncate">
              {{ formattedCurrentPeriod }}
            </span>
          </div>
        </div>

        <!-- Côté droit : badge filtres et indicateur chevron -->
        <div class="flex items-center gap-2 shrink-0">
          <UBadge
            v-if="hasFilters"
            color="primary"
            variant="subtle"
            size="xs"
            class="font-semibold"
          >
            Filtres actifs
          </UBadge>
          <div class="flex items-center text-xs font-medium text-gray-600 dark:text-gray-300">
            <span>Filtres & KPIs</span>
            <UIcon
              name="i-heroicons-chevron-up"
              class="w-4 h-4 ml-0.5 text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ── TIROIR MOBILE INFÉRIEUR (UDrawer) ── -->
    <UDrawer
      v-model:open="isMobileDrawerOpen"
      direction="bottom"
      :ui="{
        content: 'bg-[#F1F5F3] dark:bg-[#0C3C32] border-t border-black/10 dark:border-white/10 rounded-t-2xl max-h-[85vh] flex flex-col',
        handle: 'bg-gray-400/60 dark:bg-gray-500/60'
      }"
    >
      <template #content>
        <div class="p-4 space-y-4 overflow-y-auto flex-1">
          <!-- En-tête avec titre et bouton de fermeture -->
          <div class="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-adjustments-horizontal"
                class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
              />
              <h3 class="font-bold text-base text-gray-900 dark:text-white">
                Filtres & Indicateurs
              </h3>
            </div>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark"
              size="xs"
              @click="closeMobileDrawer"
            />
          </div>

          <!-- 1. COMPTEURS SUR UNE SEULE LIGNE (Revenus, Dépenses, Solde) -->
          <div class="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white/70 dark:bg-black/20 border border-black/5 dark:border-white/5 shadow-sm text-center">
            <!-- Dépenses -->
            <div class="flex flex-col items-center justify-center p-1.5">
              <span class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                Dépenses
              </span>
              <p
                v-if="summaryPending"
                class="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-1"
              />
              <span
                v-else
                class="text-xs sm:text-sm font-bold text-red-500 dark:text-red-400 truncate w-full mt-0.5"
              >
                {{ formatAmount(summary.totalExpenses) }}
              </span>
            </div>

            <!-- Revenus -->
            <div class="flex flex-col items-center justify-center p-1.5 border-x border-black/5 dark:border-white/10">
              <span class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                Revenus
              </span>
              <p
                v-if="summaryPending"
                class="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-1"
              />
              <span
                v-else
                class="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400 truncate w-full mt-0.5"
              >
                {{ formatAmount(summary.totalIncome) }}
              </span>
            </div>

            <!-- Solde -->
            <div class="flex flex-col items-center justify-center p-1.5">
              <span class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                Solde
              </span>
              <p
                v-if="summaryPending"
                class="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-1"
              />
              <span
                v-else
                class="text-xs sm:text-sm font-bold truncate w-full mt-0.5"
                :class="summary.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'"
              >
                {{ summary.balance >= 0 ? '+' : '' }}{{ formatAmount(summary.balance) }}
              </span>
            </div>
          </div>

          <!-- 2. SÉLECTEUR DE PÉRIODE -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Période analysée</label>
            <div class="overflow-x-auto max-w-full">
              <ClientOnly>
                <OwlDatePicker
                  v-if="useOwlDatePicker"
                  v-model="dateRange"
                />
                <OverviewDateRangePicker
                  v-else
                  :model-value="dateRange"
                  @update:model-value="dateRange = $event"
                />
              </ClientOnly>
            </div>
          </div>

          <!-- 3. FILTRES -->
          <div class="space-y-3 pt-1">
            <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">Filtres de recherche</label>
            <UInput
              v-model="filters.search"
              icon="i-heroicons-magnifying-glass"
              placeholder="Rechercher une transaction..."
              class="w-full"
            />

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <USelectMenu
                v-model="filters.type"
                :items="typeFilterOptions"
                value-key="value"
                label-key="label"
                placeholder="Tous les types"
                class="w-full"
              />

              <USelectMenu
                v-model="filters.accountIds"
                :items="accountOptions"
                value-key="value"
                label-key="label"
                multiple
                placeholder="Tous les comptes"
                class="w-full"
              />

              <USelectMenu
                v-model="filters.amountRange"
                :items="amountRangeOptions"
                value-key="value"
                label-key="label"
                placeholder="Tous les montants"
                class="w-full"
              />
            </div>

            <div
              v-if="hasFilters"
              class="flex justify-end pt-1"
            >
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-heroicons-x-mark"
                size="xs"
                @click="clearFilters"
              >
                Réinitialiser les filtres
              </UButton>
            </div>
          </div>

          <!-- 4. BOUTON APPLIQUER / VOIR LES TRANSACTIONS -->
          <div class="pt-2">
            <UButton
              label="Voir les transactions"
              color="primary"
              variant="solid"
              block
              size="lg"
              class="font-semibold justify-center cursor-pointer"
              @click="closeMobileDrawer"
            />
          </div>
        </div>
      </template>
    </UDrawer>

    <!-- Modale d'édition d'itération -->
    <OverviewIterationEditModal
      v-if="editingIteration"
      :iteration="editingIteration"
      @close="closeEditModal"
      @success="handleEditSuccess"
    />

    <!-- Modale de transaction ponctuelle -->
    <OverviewOneTimeTransactionModal
      v-if="isOneTimeModalOpen"
      :initial-date="dateRange.start ? new Date(dateRange.start) : undefined"
      @close="closeOneTimeModal"
      @success="handleOneTimeSuccess"
    />
  </UDashboardPanel>
</template>
