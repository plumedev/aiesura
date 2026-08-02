<script setup lang="ts">
import type { TransferRule } from '~/types'

defineProps<{
  rules: TransferRule[]
}>()

const emit = defineEmits<{
  edit: [rule: TransferRule]
  deleted: []
}>()

const toast = useToast()
const loadingId = ref<string | null>(null)
const ruleToDelete = ref<TransferRule | null>(null)
const isDeleteOpen = ref(false)

const openDeleteModal = (rule: TransferRule) => {
  ruleToDelete.value = rule
  isDeleteOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteOpen.value = false
  ruleToDelete.value = null
}

const confirmDeleteRule = async () => {
  if (!ruleToDelete.value) return
  const id = ruleToDelete.value.id
  loadingId.value = id
  try {
    await $fetch(`/api/transfer-rules/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Règle supprimée', color: 'success' })
    closeDeleteModal()
    emit('deleted')
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
      v-if="rules.length === 0"
      class="text-center py-8 text-gray-500 dark:text-gray-400 font-mono text-xs border border-dashed border-black/10 dark:border-white/10 rounded-lg"
    >
      Aucune règle configurée.
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="rule in rules"
        :key="rule.id"
        class="p-4 border border-black/10 dark:border-white/10 rounded-lg bg-[#F1F5F3] dark:bg-[#0C3C32]/40 shadow-sm flex flex-col gap-2 hover:border-black/25 dark:hover:border-white/25 transition"
      >
        <div class="flex items-center justify-between">
          <span class="font-bold text-gray-900 dark:text-white font-mono text-xs uppercase">{{ rule.purposeName }}</span>
          <div class="flex items-center gap-1">
            <UButton
              icon="i-heroicons-pencil"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="emit('edit', rule)"
            />
            <UButton
              icon="i-heroicons-trash"
              variant="ghost"
              color="error"
              size="xs"
              :loading="loadingId === rule.id"
              @click="openDeleteModal(rule)"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
          <div>
            <span class="block text-[10px] uppercase text-gray-400 dark:text-gray-500">Source</span>
            <span class="text-gray-900 dark:text-white font-semibold truncate block">{{ rule.sourceAccount?.name }}</span>
          </div>
          <div>
            <span class="block text-[10px] uppercase text-gray-400 dark:text-gray-500">Destination</span>
            <span class="text-gray-900 dark:text-white font-semibold truncate block">{{ rule.destinationAccount?.name }}</span>
          </div>
          <div v-if="rule.transitAccount">
            <span class="block text-[10px] uppercase text-gray-400 dark:text-gray-500">Transit</span>
            <span class="text-gray-900 dark:text-white font-semibold truncate block">{{ rule.transitAccount?.name }}</span>
          </div>
          <div>
            <span class="block text-[10px] uppercase text-gray-400 dark:text-gray-500">Montant</span>
            <span class="text-gray-900 dark:text-white font-semibold">
              {{ rule.amountType === 'fixed' ? formatAmount(Number(rule.amount || 0)) : formatAmount(getRecurringRuleAmount(rule)) }}
            </span>
          </div>
        </div>

        <div
          v-if="rule.amountType === 'recurring' && rule.linkedIterations && rule.linkedIterations.length > 0"
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

    <!-- Modale de confirmation de suppression -->
    <AppModal
      v-model:open="isDeleteOpen"
      title="Confirmer la suppression"
      icon="i-heroicons-exclamation-triangle"
      confirm-label="Oui, supprimer"
      confirm-color="error"
      :loading="loadingId === ruleToDelete?.id"
      @confirm="confirmDeleteRule"
      @cancel="closeDeleteModal"
    >
      <p class="text-gray-600 dark:text-gray-300 text-sm">
        Êtes-vous sûr de vouloir supprimer la règle <strong class="text-gray-900 dark:text-white">« {{ ruleToDelete?.purposeName }} »</strong> ? Cette action est irréversible.
      </p>
    </AppModal>
  </div>
</template>
