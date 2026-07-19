<script setup lang="ts">
import type { TransferRule, TransactionIteration, MonthlyChecklist, ChecklistStep, GroupedStep, GroupedTransitStep, GroupedDispatchStep, GroupedDirectStep } from '~/types'

definePageMeta({ layout: 'dashboard' })

const toast = useToast()
const { generateSteps } = useFlowPlanner()

// Gestion de la période
const now = new Date()
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

const monthLabel = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  if (!year || !month) return ''
  return new Date(year, month - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
})

const goToPrevMonth = () => {
  const parts = selectedMonth.value.split('-').map(Number)
  const year = parts[0] ?? now.getFullYear()
  const month = parts[1] ?? (now.getMonth() + 1)
  const d = new Date(year, month - 2, 1)
  selectedMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const goToNextMonth = () => {
  const parts = selectedMonth.value.split('-').map(Number)
  const year = parts[0] ?? now.getFullYear()
  const month = parts[1] ?? (now.getMonth() + 1)
  const d = new Date(year, month, 1)
  selectedMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ─── Données ──────────────────────────────────────────────────────────────────

const { data: rules, refresh: refreshRules } = await useFetch<TransferRule[]>('/api/transfer-rules')

const { data: iterations } = await useFetch<TransactionIteration[]>(
  '/api/transfer-rules/iterations',
  { query: { month: selectedMonth }, watch: [selectedMonth] }
)

const { data: currentChecklist } = await useFetch<MonthlyChecklist | null>(
  '/api/monthly-checklists',
  { query: { month: selectedMonth }, watch: [selectedMonth] }
)

const { data: accounts } = await useFetch<{ id: string, name: string }[]>('/api/accounts')

// ─── Revenus disponibles ──────────────────────────────────────────────────────

const incomeIterations = computed(() =>
  (iterations.value ?? []).filter(it => it.type === 'income')
)

const selectedIncomeIds = ref<string[]>([])
const isCalculating = ref(false)

const computedIncome = computed(() => {
  if (selectedIncomeIds.value.includes('all')) {
    return incomeIterations.value.reduce((acc, tx) => acc + Number(tx.amount || 0), 0)
  }
  let total = 0
  incomeIterations.value.forEach((tx) => {
    if (selectedIncomeIds.value.includes(tx.id)) {
      total += Number(tx.amount || 0)
    }
  })
  return total
})

const incomeOptions = computed(() => {
  const totalAll = incomeIterations.value.reduce((acc, tx) => acc + Number(tx.amount || 0), 0)
  const options = [
    { label: `Tous les revenus (${formatAmount(totalAll)})`, value: 'all' }
  ]
  incomeIterations.value.forEach((tx) => {
    options.push({
      label: `${tx.name} (${formatAmount(Number(tx.amount))})`,
      value: tx.id
    })
  })
  return options
})

const selectedIncomeObjects = computed({
  get() {
    const totalAll = incomeIterations.value.reduce((acc, tx) => acc + Number(tx.amount || 0), 0)
    if (selectedIncomeIds.value.includes('all')) {
      return [{
        label: `Tous les revenus (${formatAmount(totalAll)})`,
        value: 'all'
      }]
    }
    return incomeIterations.value
      .filter(tx => selectedIncomeIds.value.includes(tx.id))
      .map(tx => ({
        label: `${tx.name} (${formatAmount(Number(tx.amount))})`,
        value: tx.id
      }))
  },
  set(val: unknown[]) {
    const values = val.map(item => (typeof item === 'object' && item !== null && 'value' in item) ? (item as { value: string }).value : String(item))
    const hadAll = selectedIncomeIds.value.includes('all')
    const hasAll = values.includes('all')

    if (hasAll && !hadAll) {
      selectedIncomeIds.value = ['all']
    } else if (hasAll && values.length > 1) {
      selectedIncomeIds.value = values.filter(v => v !== 'all')
    } else {
      selectedIncomeIds.value = values
    }

    if (currentChecklist.value) {
      triggerGenerateChecklist(true)
    }
  }
})

const toggleIncomeSelection = (id: string, selected: boolean) => {
  if (selected) {
    if (!selectedIncomeIds.value.includes(id)) {
      selectedIncomeIds.value.push(id)
    }
  } else {
    selectedIncomeIds.value = selectedIncomeIds.value.filter(x => x !== id)
  }
  if (currentChecklist.value) {
    triggerGenerateChecklist(true)
  }
}

// Synchroniser les revenus sélectionnés avec la checklist stockée
watch([currentChecklist, incomeIterations], ([checklistVal, iterationsVal]) => {
  if (checklistVal && checklistVal.selectedIncomeIds) {
    selectedIncomeIds.value = checklistVal.selectedIncomeIds
  } else if (iterationsVal && iterationsVal.length > 0) {
    selectedIncomeIds.value = ['all']
  }
}, { immediate: true })

// ─── Modal Règle (Créer / Modifier) ───────────────────────────────────────────

const isModalOpen = ref(false)
const selectedRule = ref<TransferRule | null>(null)

const openCreateModal = () => {
  selectedRule.value = null
  isModalOpen.value = true
}

const openEditModal = (rule: TransferRule) => {
  selectedRule.value = rule
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedRule.value = null
}

const onRuleSaved = async () => {
  await refreshRules()
  if (currentChecklist.value) {
    await triggerGenerateChecklist(true)
  }
}

// ─── Planification & Checklist : Progression & Action ──────────────────────────

const progressPercentage = computed(() => {
  if (!currentChecklist.value || !currentChecklist.value.steps || currentChecklist.value.steps.length === 0) return 0

  const { groupSteps } = useFlowPlanner()
  const grouped = groupSteps(currentChecklist.value.steps)

  let totalStepsCount = 0
  let completedStepsCount = 0

  if (grouped.transits.length > 0) {
    grouped.transits.forEach((s) => {
      totalStepsCount++
      if (s.completed) completedStepsCount++
    })
  }
  if (grouped.dispatches.length > 0) {
    grouped.dispatches.forEach((s) => {
      totalStepsCount++
      if (s.completed) completedStepsCount++
    })
  }
  if (grouped.directs.length > 0) {
    grouped.directs.forEach((s) => {
      totalStepsCount++
      if (s.completed) completedStepsCount++
    })
  }

  if (totalStepsCount === 0) return 0
  return Math.round((completedStepsCount / totalStepsCount) * 100)
})

const triggerGenerateChecklist = async (preserveCompleted = false) => {
  if (computedIncome.value <= 0) {
    toast.add({ title: 'Sélectionnez au moins un revenu avec un montant supérieur à 0', color: 'error' })
    return
  }
  isCalculating.value = true
  try {
    const steps = generateSteps(
      computedIncome.value,
      rules.value || [],
      selectedMonth.value,
      currentChecklist.value?.steps || [],
      preserveCompleted
    )

    const result = await $fetch('/api/monthly-checklists', {
      method: 'POST',
      body: {
        month: selectedMonth.value,
        salary: computedIncome.value,
        selectedIncomeIds: selectedIncomeIds.value,
        steps
      }
    })

    currentChecklist.value = result
    toast.add({ title: 'Plan généré avec succès', color: 'success' })
  } catch {
    toast.add({ title: 'Erreur lors de la génération du plan', color: 'error' })
  } finally {
    isCalculating.value = false
  }
}

const handleSaveStep = async (step: GroupedStep, completed: boolean) => {
  if (!currentChecklist.value) return

  try {
    const updatedSteps = JSON.parse(JSON.stringify(currentChecklist.value.steps)) as ChecklistStep[]
    // Mettre à jour les étapes selon la catégorie de groupe cochée
    if (step.id && step.id.startsWith('grouped-transit-')) {
      const transitStep = step as GroupedTransitStep
      updatedSteps.forEach((s: ChecklistStep) => {
        if (s.sourceName === transitStep.sourceName && (s.transitName === transitStep.transitName || (!s.transitName && s.destName === transitStep.transitName))) {
          s.transitCompleted = completed
        }
      })
    } else if (step.id && step.id.startsWith('grouped-dispatch-')) {
      const dispatchStep = step as GroupedDispatchStep
      updatedSteps.forEach((s: ChecklistStep) => {
        if (s.transitName === dispatchStep.transitName && s.destName === dispatchStep.destName) {
          s.completed = completed
        }
      })
    } else if (step.id && step.id.startsWith('grouped-direct-')) {
      const directStep = step as GroupedDirectStep
      updatedSteps.forEach((s: ChecklistStep) => {
        if (s.sourceName === directStep.sourceName && s.destName === directStep.destName) {
          s.completed = completed
        }
      })
    }

    const result = await $fetch(`/api/monthly-checklists/${currentChecklist.value.id}`, {
      method: 'PATCH',
      body: {
        steps: updatedSteps
      }
    })
    currentChecklist.value = result
  } catch {
    toast.add({ title: 'Erreur lors de la mise à jour de la checklist', color: 'error' })
  }
}

const onRuleDeleted = async () => {
  await refreshRules()
  if (currentChecklist.value) {
    await triggerGenerateChecklist(true)
  }
}
</script>

<template>
  <UDashboardPanel id="flows">
    <template #header>
      <UDashboardNavbar title="Flux Mensuels">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="Créer une règle"
            icon="i-heroicons-plus"
            color="primary"
            class="text-xs"
            @click="openCreateModal"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-6 overflow-auto h-full min-h-0 font-sans w-full bg-transparent">
        <!-- Top bar: Date Selector & Income Selection -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Column 1: Period Selection & Action/Progress -->
          <UCard class="lg:col-span-1 border border-black/10 dark:border-white/10 bg-[#F1F5F3] dark:bg-[#0C3C32] flex flex-col justify-between shadow-sm">
            <div class="space-y-4">
              <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Période de planification
              </div>
              <div class="flex items-center gap-2">
                <UButton
                  icon="i-heroicons-chevron-left"
                  variant="ghost"
                  color="neutral"
                  @click="goToPrevMonth"
                />
                <div class="flex-1 text-center font-semibold text-gray-900 dark:text-white capitalize text-sm">
                  {{ monthLabel }}
                </div>
                <UButton
                  icon="i-heroicons-chevron-right"
                  variant="ghost"
                  color="neutral"
                  @click="goToNextMonth"
                />
              </div>
            </div>

            <!-- Action Button & Progress -->
            <div
              v-if="currentChecklist"
              class="mt-4 pt-4 border-t border-black/10 dark:border-white/10 space-y-4"
            >
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-gray-500 dark:text-gray-400">Progression</span>
                  <span class="text-gray-900 dark:text-white font-bold">{{ progressPercentage }}%</span>
                </div>
                <div class="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500 bg-green-500 dark:bg-green-400"
                    :style="{ width: progressPercentage + '%' }"
                  />
                </div>
              </div>

              <UButton
                label="Recalculer le plan"
                color="primary"
                icon="i-heroicons-play"
                :loading="isCalculating"
                :disabled="computedIncome <= 0"
                class="w-full justify-center text-xs"
                @click="() => triggerGenerateChecklist(false)"
              />
            </div>
          </UCard>

          <!-- Column 2 & 3: Incomes selection -->
          <UCard class="lg:col-span-2 border border-black/10 dark:border-white/10 bg-[#F1F5F3] dark:bg-[#0C3C32] shadow-sm">
            <div class="flex flex-col justify-between h-full gap-4">
              <div class="space-y-3">
                <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Revenus de planification</span>
                  <span class="text-gray-900 dark:text-white text-sm font-bold">Total : {{ formatAmount(computedIncome) }}</span>
                </div>

                <USelectMenu
                  v-model="selectedIncomeObjects"
                  :items="incomeOptions"
                  multiple
                  placeholder="Sélectionner les revenus à inclure..."
                  class="w-full font-bold"
                  icon="i-heroicons-banknotes"
                />
              </div>

              <!-- Selected incomes badges list -->
              <div class="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                <UBadge
                  v-for="item in selectedIncomeObjects"
                  :key="item.value"
                  variant="soft"
                  color="neutral"
                  class="text-[11px] py-0.5 px-2 flex items-center gap-1 font-medium"
                >
                  <span>{{ item.label }}</span>
                  <UIcon
                    name="i-heroicons-x-mark"
                    class="w-3 h-3 cursor-pointer text-gray-500 hover:text-red-500 transition"
                    @click.stop="toggleIncomeSelection(item.value, false)"
                  />
                </UBadge>
                <div
                  v-if="selectedIncomeObjects.length === 0"
                  class="text-[11px] text-gray-500 dark:text-gray-400 italic"
                >
                  Aucun revenu sélectionné pour la planification.
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Visual Flow Model -->
        <FlowsFlowDiagram
          :rules="rules ?? []"
          :steps="currentChecklist?.steps ?? []"
        />

        <!-- Two Columns: Rules Listing & Active Checklist -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Column 1: Rules List -->
          <div class="lg:col-span-1 space-y-4">
            <div class="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Règles enregistrées ({{ rules?.length ?? 0 }})
              </h3>
              <UButton
                icon="i-heroicons-plus"
                color="primary"
                variant="solid"
                size="xs"
                square
                @click="openCreateModal"
              />
            </div>
            <FlowsRulesList
              :rules="rules ?? []"
              @edit="openEditModal"
              @deleted="onRuleDeleted"
            />
          </div>

          <!-- Column 2: Active Checklist steps -->
          <div class="lg:col-span-2 space-y-4">
            <div
              v-if="!currentChecklist"
              class="text-center py-12 text-gray-500 dark:text-gray-400 text-xs border border-dashed border-black/10 dark:border-white/10 rounded-lg flex flex-col items-center justify-center gap-3"
            >
              <UIcon
                name="i-heroicons-git-fork"
                class="w-8 h-8 text-gray-400/50"
              />
              <span>Aucun plan d'action généré pour ce mois. Sélectionnez vos revenus récurrents ci-dessus, puis cliquez sur "Générer le plan".</span>
              <UButton
                label="Générer le plan de ce mois"
                color="primary"
                icon="i-heroicons-play"
                :loading="isCalculating"
                :disabled="computedIncome <= 0"
                @click="() => triggerGenerateChecklist(false)"
              />
            </div>

            <FlowsTodoList
              v-else
              :steps="currentChecklist.steps"
              @save-step="handleSaveStep"
            />
          </div>
        </div>
      </div>

      <!-- Modale de création / édition -->
      <FlowsRuleFormModal
        :open="isModalOpen"
        :rule="selectedRule"
        :iterations="iterations ?? []"
        :accounts="accounts ?? []"
        @close="closeModal"
        @created="onRuleSaved"
      />
    </template>
  </UDashboardPanel>
</template>
