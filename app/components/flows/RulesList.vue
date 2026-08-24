<script setup lang="ts">
import type { TransferRule, ChecklistStep } from '~/types'

const props = defineProps<{
  rules: TransferRule[]
  monthlySteps?: ChecklistStep[]
  hasCurrentPlan?: boolean
  monthLabel?: string
}>()

const emit = defineEmits<{
  edit: [rule: TransferRule | ChecklistStep]
  deleted: []
  deleteMonthly: [ruleId: string]
}>()

const toast = useToast()
const loadingId = ref<string | null>(null)
const itemToDelete = ref<{ id: string, name: string, isCustomMonthly?: boolean, isGlobal?: boolean } | null>(null)
const deleteScope = ref<'month' | 'global'>('month')
const isDeleteOpen = ref(false)

const deleteScopeOptions = computed(() => [
  {
    label: props.monthLabel ? `Retirer de ce mois uniquement (${props.monthLabel})` : 'Retirer de ce mois uniquement',
    value: 'month'
  },
  {
    label: 'Supprimer définitivement le modèle (tous les mois)',
    value: 'global'
  }
])

const getStepForRule = (ruleId: string): ChecklistStep | undefined => {
  return props.monthlySteps?.find(s => s.ruleId === ruleId)
}

const isRuleOverridden = (ruleId: string): boolean => {
  const step = getStepForRule(ruleId)
  return !!(step && step.isMonthlyOverride)
}

const isRuleRemovedThisMonth = (ruleId: string): boolean => {
  if (!props.hasCurrentPlan || !props.monthlySteps) return false
  return !props.monthlySteps.some(s => s.ruleId === ruleId)
}

const customMonthlySteps = computed(() => {
  if (!props.monthlySteps) return []
  const blueprintRuleIds = new Set(props.rules.map(r => r.id))
  return props.monthlySteps.filter(s => s.isMonthlyOverride && !blueprintRuleIds.has(s.ruleId))
})

const handleEditRule = (rule: TransferRule) => {
  const overriddenStep = getStepForRule(rule.id)
  if (overriddenStep && overriddenStep.isMonthlyOverride) {
    emit('edit', overriddenStep)
  } else {
    emit('edit', rule)
  }
}

const handleEditCustomStep = (step: ChecklistStep) => {
  emit('edit', step)
}

const openDeleteRuleModal = (rule: TransferRule) => {
  const isPresentInMonth = props.monthlySteps?.some(s => s.ruleId === rule.id)
  itemToDelete.value = {
    id: rule.id,
    name: rule.purposeName,
    isCustomMonthly: false,
    isGlobal: true
  }
  deleteScope.value = props.hasCurrentPlan && isPresentInMonth ? 'month' : 'global'
  isDeleteOpen.value = true
}

const openDeleteCustomStepModal = (step: ChecklistStep) => {
  itemToDelete.value = {
    id: step.ruleId,
    name: step.name,
    isCustomMonthly: true,
    isGlobal: false
  }
  deleteScope.value = 'month'
  isDeleteOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteOpen.value = false
  itemToDelete.value = null
}

const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return
  const id = itemToDelete.value.id
  loadingId.value = id

  try {
    if (itemToDelete.value.isCustomMonthly || deleteScope.value === 'month') {
      emit('deleteMonthly', id)
      closeDeleteModal()
    } else {
      await $fetch(`/api/transfer-rules/${id}`, { method: 'DELETE' })
      toast.add({ title: 'Modèle global supprimé', color: 'success' })
      closeDeleteModal()
      emit('deleted')
    }
  } catch {
    toast.add({ title: 'Erreur lors de la suppression', color: 'error' })
  } finally {
    loadingId.value = null
  }
}

const getRecurringRuleAmount = (rule: TransferRule): number => {
  let total = 0
  if (rule.linkedIterations && Array.isArray(rule.linkedIterations)) {
    rule.linkedIterations.forEach((li) => {
      const amt = Number(li.amount || 0)
      total += amt * ((li.percentage || 100) / 100)
    })
  }
  return total
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="rules.length === 0 && customMonthlySteps.length === 0"
      class="text-center py-8 text-gray-500 dark:text-gray-400 font-mono text-xs border border-dashed border-black/10 dark:border-white/10 rounded-lg"
    >
      Aucune règle configurée.
    </div>

    <!-- Liste des règles permanentes (Blueprint) -->
    <div
      v-if="rules.length > 0"
      class="space-y-3"
    >
      <div
        v-for="rule in rules"
        :key="rule.id"
        class="p-4 border border-black/10 dark:border-white/10 rounded-lg bg-[#F1F5F3] dark:bg-[#0C3C32]/40 shadow-sm flex flex-col gap-2 hover:border-black/25 dark:hover:border-white/25 transition"
        :class="{ 'opacity-60': isRuleRemovedThisMonth(rule.id) }"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-gray-900 dark:text-white font-mono text-xs uppercase">{{ rule.purposeName }}</span>
            <UBadge
              v-if="isRuleOverridden(rule.id)"
              size="xs"
              variant="soft"
              color="warning"
              class="text-[9px]"
            >
              Modifié ce mois
            </UBadge>
            <UBadge
              v-else-if="isRuleRemovedThisMonth(rule.id)"
              size="xs"
              variant="soft"
              color="neutral"
              class="text-[9px]"
            >
              Retiré ce mois
            </UBadge>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <UButton
              icon="i-heroicons-pencil"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="handleEditRule(rule)"
            />
            <UButton
              icon="i-heroicons-trash"
              variant="ghost"
              color="error"
              size="xs"
              :loading="loadingId === rule.id"
              @click="openDeleteRuleModal(rule)"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
          <div>
            <span class="block text-[10px] uppercase text-gray-400 dark:text-gray-500">Source</span>
            <span class="text-gray-900 dark:text-white font-semibold truncate block">
              {{ isRuleOverridden(rule.id) ? (getStepForRule(rule.id)?.sourceName || rule.sourceAccount?.name) : rule.sourceAccount?.name }}
            </span>
          </div>
          <div>
            <span class="block text-[10px] uppercase text-gray-400 dark:text-gray-500">Destination</span>
            <span class="text-gray-900 dark:text-white font-semibold truncate block">
              {{ isRuleOverridden(rule.id) ? (getStepForRule(rule.id)?.destName || rule.destinationAccount?.name) : rule.destinationAccount?.name }}
            </span>
          </div>
          <div v-if="rule.transitAccount || (isRuleOverridden(rule.id) && getStepForRule(rule.id)?.transitName)">
            <span class="block text-[10px] uppercase text-gray-400 dark:text-gray-500">Transit</span>
            <span class="text-gray-900 dark:text-white font-semibold truncate block">
              {{ isRuleOverridden(rule.id) ? (getStepForRule(rule.id)?.transitName || rule.transitAccount?.name) : rule.transitAccount?.name }}
            </span>
          </div>
          <div>
            <span class="block text-[10px] uppercase text-gray-400 dark:text-gray-500">Montant</span>
            <div class="flex items-baseline gap-1.5 flex-wrap">
              <span class="text-gray-900 dark:text-white font-semibold">
                <template v-if="isRuleOverridden(rule.id)">
                  {{ formatAmount(Number(getStepForRule(rule.id)?.amount || 0)) }}
                </template>
                <template v-else>
                  {{ rule.amountType === 'fixed' ? formatAmount(Number(rule.amount || 0)) : formatAmount(getRecurringRuleAmount(rule)) }}
                </template>
              </span>
              <span
                v-if="isRuleOverridden(rule.id)"
                class="text-[10px] text-gray-400 dark:text-gray-500 line-through"
              >
                {{ rule.amountType === 'fixed' ? formatAmount(Number(rule.amount || 0)) : formatAmount(getRecurringRuleAmount(rule)) }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="rule.amountType === 'recurring' && rule.linkedIterations && rule.linkedIterations.length > 0 && !isRuleOverridden(rule.id)"
          class="mt-2 pt-2 border-t border-black/10 dark:border-white/10 space-y-1.5 font-mono text-[11px]"
        >
          <div class="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
            Dépenses incluses ({{ rule.linkedIterations.length }})
          </div>
          <div class="space-y-1 max-h-36 overflow-y-auto pr-1">
            <div
              v-for="li in rule.linkedIterations"
              :key="li.id"
              class="flex items-center justify-between bg-black/5 dark:bg-white/5 px-2 py-1 rounded text-gray-700 dark:text-gray-300"
            >
              <div class="flex items-center gap-1.5 min-w-0">
                <UIcon
                  name="i-heroicons-arrow-right-tiny"
                  class="w-3 h-3 text-gray-400 shrink-0"
                />
                <span class="font-medium text-gray-900 dark:text-white truncate">{{ li.name }}</span>
                <span
                  v-if="li.transaction?.account?.name"
                  class="text-[9px] text-gray-400 dark:text-gray-500 shrink-0"
                >({{ li.transaction.account.name }})</span>
              </div>
              <div class="flex items-center gap-1 shrink-0 ml-2">
                <UBadge
                  v-if="li.percentage < 100"
                  size="xs"
                  variant="soft"
                  color="neutral"
                  class="text-[9px]"
                >
                  {{ li.percentage }}%
                </UBadge>
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ formatAmount(Number(li.amount || 0) * (li.percentage / 100)) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Virements ponctuels de ce mois -->
    <div
      v-if="customMonthlySteps.length > 0"
      class="space-y-3 pt-2"
    >
      <div class="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-1">
        <UIcon
          name="i-heroicons-sparkles"
          class="w-4 h-4 text-amber-500"
        />
        <h4 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-mono">
          Virements ponctuels ({{ monthLabel || 'Ce mois' }})
        </h4>
      </div>

      <div
        v-for="step in customMonthlySteps"
        :key="step.ruleId"
        class="p-4 border border-amber-500/30 rounded-lg bg-amber-500/5 shadow-sm flex flex-col gap-2 hover:border-amber-500/50 transition"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="font-bold text-gray-900 dark:text-white font-mono text-xs uppercase">{{ step.name }}</span>
            <UBadge
              size="xs"
              variant="soft"
              color="warning"
              class="text-[9px]"
            >
              Ponctuel
            </UBadge>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <UButton
              icon="i-heroicons-pencil"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="handleEditCustomStep(step)"
            />
            <UButton
              icon="i-heroicons-trash"
              variant="ghost"
              color="error"
              size="xs"
              :loading="loadingId === step.ruleId"
              @click="openDeleteCustomStepModal(step)"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
          <div>
            <span class="block text-[10px] uppercase text-gray-400 dark:text-gray-500">Source</span>
            <span class="text-gray-900 dark:text-white font-semibold truncate block">{{ step.sourceName }}</span>
          </div>
          <div>
            <span class="block text-[10px] uppercase text-gray-400 dark:text-gray-500">Destination</span>
            <span class="text-gray-900 dark:text-white font-semibold truncate block">{{ step.destName }}</span>
          </div>
          <div v-if="step.transitName">
            <span class="block text-[10px] uppercase text-gray-400 dark:text-gray-500">Transit</span>
            <span class="text-gray-900 dark:text-white font-semibold truncate block">{{ step.transitName }}</span>
          </div>
          <div>
            <span class="block text-[10px] uppercase text-gray-400 dark:text-gray-500">Montant</span>
            <span class="text-gray-900 dark:text-white font-semibold">{{ formatAmount(step.amount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modale de confirmation de suppression -->
    <AppModal
      :open="isDeleteOpen"
      title="Supprimer la règle"
      icon="i-heroicons-exclamation-triangle"
      confirm-label="Confirmer la suppression"
      confirm-color="error"
      :loading="loadingId === itemToDelete?.id"
      @confirm="handleConfirmDelete"
      @cancel="closeDeleteModal"
      @update:open="(val) => { if (!val) closeDeleteModal() }"
    >
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-300 text-sm">
          Vous êtes sur le point de supprimer <strong class="text-gray-900 dark:text-white">« {{ itemToDelete?.name }} »</strong>.
        </p>

        <!-- Choix de portée si la règle est globale et qu'un plan mensuel est actif -->
        <div
          v-if="hasCurrentPlan && itemToDelete?.isGlobal"
          class="space-y-2"
        >
          <UFormField
            label="Portée de la suppression"
            help="Choisissez si la suppression s'applique uniquement à la checklist de ce mois ou au modèle global."
          >
            <USelect
              v-model="deleteScope"
              :items="deleteScopeOptions"
              class="w-full font-medium"
            />
          </UFormField>
        </div>

        <p
          v-else-if="itemToDelete?.isCustomMonthly"
          class="text-xs text-gray-500 dark:text-gray-400 font-mono bg-black/5 dark:bg-white/5 p-2 rounded"
        >
          Ce virement ponctuel sera retiré uniquement du plan de {{ monthLabel || 'ce mois' }}.
        </p>
      </div>
    </AppModal>
  </div>
</template>
