<script setup lang="ts">
import { mockOverviewTransactions } from '~/utils/landingMockData'
import { formatAmount, formatDate, formatDateForInput } from '~/utils'
import type { TransactionWithIterations, TransactionIteration } from '~/types/overview'

// Clone réactif des transactions pour permettre l'interaction et la modification
const transactions = ref<TransactionWithIterations[]>(JSON.parse(JSON.stringify(mockOverviewTransactions)))

const expandedRows = ref<Set<string>>(new Set(['tx-3']))

const toggleRow = (id: string) => {
  if (expandedRows.value.has(id)) {
    expandedRows.value.delete(id)
  } else {
    expandedRows.value.add(id)
  }
}

// Calcul dynamique des KPIs
const totalExpenses = computed(() => {
  return transactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.totalAmount), 0)
})

const totalIncome = computed(() => {
  return transactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.totalAmount), 0)
})

const balance = computed(() => totalIncome.value - totalExpenses.value)

// Modale d'édition d'itération (Fidèle à IterationEditModal.vue)
const editingIteration = ref<TransactionIteration | null>(null)
const editingParentTx = ref<TransactionWithIterations | null>(null)

const modalForm = reactive({
  name: '',
  amount: 0,
  executionDate: ''
})

const openEditModal = (tx: TransactionWithIterations, iter: TransactionIteration) => {
  editingParentTx.value = tx
  editingIteration.value = iter
  modalForm.name = iter.name
  modalForm.amount = iter.amount
  modalForm.executionDate = formatDateForInput(iter.executionDate)
}

const closeEditModal = () => {
  editingIteration.value = null
  editingParentTx.value = null
}

const saveIteration = () => {
  if (!editingIteration.value || !editingParentTx.value) return

  editingIteration.value.name = modalForm.name
  editingIteration.value.amount = Number(modalForm.amount)
  editingIteration.value.executionDate = new Date(modalForm.executionDate).toISOString()
  editingIteration.value.isModified = true

  // Recalculer le totalAmount de la transaction parente
  editingParentTx.value.totalAmount = editingParentTx.value.iterations.reduce((s, it) => s + Number(it.amount), 0)

  closeEditModal()
}
</script>

<template>
  <div class="rounded-2xl border border-black/10 dark:border-white/10 bg-[#F1F5F3] dark:bg-[#0C3C32] p-6 sm:p-8 shadow-xl space-y-6">
    <!-- En-tête explicatif fidèle -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
      <div>
        <div class="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          <UIcon
            name="i-heroicons-calendar"
            class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
          />
          <span>Tableau de bord : Vue d'ensemble</span>
        </div>
        <h4 class="text-xl font-bold text-gray-900 dark:text-white">
          Ajustez vos itérations au mois le mois
        </h4>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Dépliez la transaction « Courses hebdomadaires » et cliquez sur « Modifier » pour ajuster une occurrence précise.
        </p>
      </div>

      <span class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/80 dark:bg-black/20 text-gray-700 dark:text-gray-200 border border-black/5 dark:border-white/5 self-start sm:self-auto">
        Période : Octobre 2026
      </span>
    </div>

    <!-- ── KPI Cards (Strictement identiques à dashboard/index.vue) ── -->
    <div class="grid grid-cols-1 sm:grid-cols-3 rounded-xl overflow-hidden shadow ring-1 ring-gray-200 dark:ring-gray-800 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-800 bg-[#F1F5F3] dark:bg-[#0C3C32]">
      <!-- Dépenses -->
      <div class="p-4 sm:p-5 flex flex-col gap-2">
        <div class="w-8 h-8 rounded-full flex items-center justify-center border bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20">
          <UIcon
            name="i-heroicons-arrow-down-left"
            class="w-4 h-4 text-red-500 dark:text-red-400"
          />
        </div>
        <div>
          <p class="text-[11px] font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">
            Dépenses
          </p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mt-0.5 tabular-nums">
            {{ formatAmount(totalExpenses, 'expense') }}
          </p>
        </div>
      </div>

      <!-- Revenus -->
      <div class="p-4 sm:p-5 flex flex-col gap-2">
        <div class="w-8 h-8 rounded-full flex items-center justify-center border bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20">
          <UIcon
            name="i-heroicons-arrow-up-right"
            class="w-4 h-4 text-green-500 dark:text-green-400"
          />
        </div>
        <div>
          <p class="text-[11px] font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">
            Revenus
          </p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mt-0.5 tabular-nums">
            {{ formatAmount(totalIncome, 'income') }}
          </p>
        </div>
      </div>

      <!-- Solde -->
      <div class="p-4 sm:p-5 flex flex-col gap-2">
        <div class="w-8 h-8 rounded-full flex items-center justify-center border bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20">
          <UIcon
            name="i-heroicons-banknotes"
            class="w-4 h-4 text-blue-500 dark:text-blue-400"
          />
        </div>
        <div>
          <p class="text-[11px] font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">
            Solde
          </p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mt-0.5 tabular-nums">
            {{ formatAmount(balance, 'income') }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── Tableau des transactions avec sous-lignes (Exactement comme dashboard/index.vue) ── -->
    <div class="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A332C] shadow-sm">
      <table class="w-full text-xs sm:text-sm">
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
            <th class="px-4 py-3 w-16 text-center">
              Action
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black/5 dark:divide-white/5">
          <template
            v-for="tx in transactions"
            :key="tx.id"
          >
            <!-- Ligne transaction principale -->
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

              <td class="px-4 py-3 text-center">
                <UButton
                  v-if="tx.iterationCount === 1"
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-pencil-square"
                  size="xs"
                  class="cursor-pointer"
                  @click.stop="openEditModal(tx, tx.iterations[0]!)"
                />
              </td>
            </tr>

            <!-- Sous-lignes d'itérations -->
            <template v-if="expandedRows.has(tx.id) && tx.iterationCount > 1">
              <tr
                v-for="iter in tx.iterations"
                :key="iter.id"
                class="bg-black/[0.02] dark:bg-white/[0.04] text-xs"
              >
                <td class="pl-12 py-2.5 pr-4 text-gray-700 dark:text-gray-300">
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

                <td class="px-4 py-2 text-right font-medium text-gray-900 dark:text-white tabular-nums">
                  {{ formatAmount(iter.amount, iter.type) }}
                </td>

                <td class="px-4 py-2 text-center">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-heroicons-pencil-square"
                    size="xs"
                    class="cursor-pointer"
                    @click.stop="openEditModal(tx, iter)"
                  />
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <!-- ── Modale d'édition d'itération (Identique à IterationEditModal.vue) ── -->
    <AppModal
      v-if="editingIteration"
      :open="true"
      title="Modifier l'itération"
      description="Cette modification s'applique uniquement à cette occurrence dans la plage analysée. La transaction parente reste intacte."
      @close="closeEditModal"
    >
      <form
        class="space-y-4"
        @submit.prevent="saveIteration"
      >
        <!-- Nom -->
        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Libellé de l'itération
          </label>
          <UInput
            v-model="modalForm.name"
            placeholder="Ex: Courses Semaine 2 (Dîner)"
            class="w-full"
          />
        </div>

        <!-- Montant -->
        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Montant (€)
          </label>
          <UInput
            v-model.number="modalForm.amount"
            type="number"
            step="0.01"
            placeholder="Ex: 175.00"
            class="w-full font-bold"
          />
        </div>

        <!-- Date d'exécution -->
        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Date d'exécution
          </label>
          <UInput
            v-model="modalForm.executionDate"
            type="date"
            class="w-full"
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            label="Annuler"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="closeEditModal"
          />
          <UButton
            type="submit"
            label="Enregistrer l'itération"
            color="primary"
            variant="solid"
            size="sm"
          />
        </div>
      </form>
    </AppModal>
  </div>
</template>
