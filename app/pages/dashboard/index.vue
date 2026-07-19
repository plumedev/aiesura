<script setup lang="ts">
import { useIntersectionObserver, useLocalStorage } from '@vueuse/core'
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
  { label: 'Tous les types', value: null },
  { label: 'Revenus', value: 'income' },
  { label: 'Dépenses', value: 'expense' }
]

const amountRangeOptions = [
  { label: 'Tous les montants', value: null },
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
  filters.type = null
  filters.accountIds = []
  filters.amountRange = null
}
</script>

<template>
  <UDashboardPanel id="overview">
    <UDashboardNavbar title="Vue d'ensemble">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
      <template #right>
        <UButton
          :icon="useOwlDatePicker ? 'i-heroicons-calendar' : 'i-heroicons-adjustments-horizontal'"
          :label="useOwlDatePicker ? 'Sélecteur standard' : 'Sélecteur Slider'"
          color="neutral"
          variant="ghost"
          size="xs"
          class="rounded-md"
          @click="toggleDatePicker"
        />
      </template>
    </UDashboardNavbar>

    <div class="flex flex-col gap-6 p-4 h-full overflow-y-auto lg:overflow-hidden">
      <!-- ── Sélecteur de période ── -->
      <div class="flex items-center">
        <p class="text-sm mr-2 text-gray-500 dark:text-gray-400">
          Période analysée
        </p>
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

      <!-- ── KPI Cards ── -->
      <div class="grid grid-cols-1 sm:grid-cols-3 rounded-xl overflow-hidden shadow ring-1 ring-gray-200 dark:ring-gray-800 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-800 bg-[#F1F5F3] dark:bg-[#0C3C32]">
        <div
          v-for="kpi in kpiCards"
          :key="kpi.label"
          class="p-4 sm:p-6 flex flex-col gap-3"
        >
          <!-- Icon Badge -->
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center border', kpi.badgeClass]">
            <UIcon
              :name="kpi.icon"
              :class="['w-4 h-4', kpi.iconClass]"
            />
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-[11px] font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">
              {{ kpi.label }}
            </p>
            <p
              v-if="summaryPending"
              class="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-1"
            />
            <p
              v-else
              class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
            >
              {{ kpi.value }}
            </p>
          </div>
        </div>
      </div>

      <!-- ── Filtres ── -->
      <UCard>
        <div class="flex flex-wrap gap-3 items-center">
          <!-- Recherche -->
          <UInput
            v-model="filters.search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Rechercher une transaction..."
            class="w-60"
          />

          <!-- Type -->
          <USelectMenu
            v-model="filters.type"
            :items="typeFilterOptions"
            value-key="value"
            label-key="label"
            placeholder="Type"
            class="w-44"
          />

          <!-- Comptes (multiselect) -->
          <USelectMenu
            v-model="filters.accountIds"
            :items="accountOptions"
            value-key="value"
            label-key="label"
            multiple
            placeholder="Comptes"
            class="w-48"
          />

          <!-- Montant -->
          <USelectMenu
            v-model="filters.amountRange"
            :items="amountRangeOptions"
            value-key="value"
            label-key="label"
            placeholder="Montant"
            class="w-48"
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

        <div v-else>
          <table class="w-full text-sm">
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

    <!-- Modale d'édition d'itération -->
    <OverviewIterationEditModal
      v-if="editingIteration"
      :iteration="editingIteration"
      @close="closeEditModal"
      @success="handleEditSuccess"
    />
  </UDashboardPanel>
</template>
