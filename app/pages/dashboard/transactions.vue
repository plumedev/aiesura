<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

interface Transaction {
  id: string
  name: string
  startDate: string
  endDate: string | null
  frequency: 'once' | 'monthly' | 'quarterly' | 'yearly'
  type: 'income' | 'expense'
  amount: string
  accountId: string
  account: { id: string, name: string }
}

const { data: transactions, refresh } = await useFetch<Transaction[]>('/api/transactions')

const isModalOpen = ref(false)
const search = ref('')
const sorting = ref([])

// Render function pour les en-têtes triables — évite la duplication ×6
const sortableHeader = (label: string) => ({ column }: { column: { getIsSorted: () => false | 'asc' | 'desc', toggleSorting: (desc: boolean) => void } }) =>
  h(resolveComponent('UButton'), {
    variant: 'ghost',
    color: 'neutral',
    class: '-ml-2.5 font-semibold text-gray-900 dark:text-white',
    icon: column.getIsSorted()
      ? column.getIsSorted() === 'desc' ? 'i-heroicons-bars-arrow-down' : 'i-heroicons-bars-arrow-up'
      : 'i-heroicons-arrows-up-down',
    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
  }, () => label)

const columns = [
  { accessorKey: 'name', header: sortableHeader('Libellé') },
  { accessorKey: 'startDate', header: sortableHeader('Date') },
  { accessorKey: 'frequency', header: sortableHeader('Fréquence') },
  { accessorKey: 'type', header: sortableHeader('Type') },
  { accessorKey: 'account', header: sortableHeader('Compte') },
  { accessorKey: 'amount', header: sortableHeader('Montant') },
  { id: 'actions', header: '' }
]

const filteredTransactions = computed<Transaction[]>(() => {
  if (!transactions.value) return []
  return transactions.value.filter((t) => {
    if (search.value && !t.name.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  })
})

// Totaux récurrents mensualisés équivalents (Mensuel: 1x, Trimestriel: /3, Annuel: /12, Once: exclu)
const monthlyExpenses = computed(() => {
  return filteredTransactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => {
      const amt = Number(t.amount)
      if (t.frequency === 'monthly') return sum + amt
      if (t.frequency === 'quarterly') return sum + (amt / 3)
      if (t.frequency === 'yearly') return sum + (amt / 12)
      return sum
    }, 0)
})

const monthlyIncome = computed(() => {
  return filteredTransactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => {
      const amt = Number(t.amount)
      if (t.frequency === 'monthly') return sum + amt
      if (t.frequency === 'quarterly') return sum + (amt / 3)
      if (t.frequency === 'yearly') return sum + (amt / 12)
      return sum
    }, 0)
})

const monthlyBalance = computed(() => monthlyIncome.value - monthlyExpenses.value)

const toast = useToast()
const deleteLoading = ref(false)
const transactionToDelete = ref<Transaction | null>(null)
const isDeleteModalOpen = ref(false)

const openDeleteModal = (transaction: Transaction) => {
  transactionToDelete.value = transaction
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  transactionToDelete.value = null
}

// --- Swipe mobile des transactions ---
const activeMobileSwipeId = ref<string | null>(null)

const handleEditMobileTransaction = (tx: Transaction) => {
  activeMobileSwipeId.value = null
  openEditModal(tx)
}

const handleDeleteMobileTransaction = (tx: Transaction) => {
  activeMobileSwipeId.value = null
  openDeleteModal(tx)
}

async function confirmDeleteTransaction() {
  if (!transactionToDelete.value) return
  deleteLoading.value = true
  try {
    await $fetch(`/api/transactions/${transactionToDelete.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Transaction supprimée', color: 'success' })
    closeDeleteModal()
    refresh()
  } catch {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de supprimer la transaction',
      color: 'error'
    })
  } finally {
    deleteLoading.value = false
  }
}

const editingTransaction = ref<Transaction | null>(null)
const isEditModalOpen = computed({
  get: () => !!editingTransaction.value,
  set: (val) => {
    if (!val) {
      editingTransaction.value = null
    }
  }
})

const openEditModal = (transaction: Transaction) => {
  editingTransaction.value = transaction
}

const closeEditModal = () => {
  editingTransaction.value = null
}

const handleEditSuccess = () => {
  closeEditModal()
  refresh()
}

function handleSuccess() {
  isModalOpen.value = false
  refresh()
}

const closeModal = () => {
  isModalOpen.value = false
}

const openModal = () => {
  isModalOpen.value = true
}

const getRow = (row: unknown): Record<string, unknown> => (row as { original?: Record<string, unknown> }).original || (row as Record<string, unknown>)

const getDropdownItems = (row: unknown) => [
  [
    {
      label: 'Éditer',
      icon: 'i-heroicons-pencil-square',
      onSelect: () => {
        openEditModal(getRow(row) as unknown as Transaction)
      }
    }
  ],
  [
    {
      label: 'Supprimer',
      icon: 'i-heroicons-trash',
      color: 'error' as const,
      onSelect: () => {
        openDeleteModal(getRow(row) as unknown as Transaction)
      }
    }
  ]
]
// formatFrequency et TRANSACTION_TYPE_LABELS sont auto-importés depuis ~/utils
</script>

<template>
  <UDashboardPanel id="transactions">
    <UDashboardNavbar title="Transactions">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
      <template #right>
        <div class="hidden lg:flex items-center gap-6 text-sm mr-2 border-r border-gray-200 dark:border-gray-800 pr-6">
          <div
            class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
            title="Dépenses récurrentes mensualisées (mensuel + trimestriel/3 + annuel/12)"
          >
            <UIcon
              name="i-heroicons-arrow-down-left"
              class="w-4 h-4 text-red-400"
            />
            Dépenses : <span class="font-semibold text-gray-900 dark:text-white">{{ monthlyExpenses.toFixed(2) }} €<span class="text-xs font-normal text-gray-400">/mois</span></span>
          </div>
          <div
            class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
            title="Revenus récurrents mensualisés"
          >
            <UIcon
              name="i-heroicons-arrow-up-right"
              class="w-4 h-4 text-green-500"
            />
            Revenus : <span class="font-semibold text-gray-900 dark:text-white">{{ monthlyIncome.toFixed(2) }} €<span class="text-xs font-normal text-gray-400">/mois</span></span>
          </div>
          <div
            class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
            title="Solde net récurrent mensuel"
          >
            <UIcon
              name="i-heroicons-arrows-right-left"
              class="w-4 h-4 text-blue-500"
            />
            Solde : <span
              class="font-semibold"
              :class="monthlyBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'"
            >
              {{ monthlyBalance >= 0 ? '+' : '' }}{{ monthlyBalance.toFixed(2) }} €<span class="text-xs font-normal text-gray-400">/mois</span>
            </span>
          </div>
        </div>

        <UButton
          icon="i-heroicons-plus"
          color="primary"
          @click="openModal"
        >
          <span class="hidden sm:inline">Ajouter une transaction</span>
          <span class="sm:hidden">Ajouter</span>
        </UButton>
      </template>
    </UDashboardNavbar>

    <div class="flex flex-col gap-4 p-4 h-full overflow-hidden">
      <!-- Mini summary cards sur mobile (< lg) -->
      <div class="grid grid-cols-3 gap-2 lg:hidden">
        <div class="p-2 sm:p-2.5 rounded-lg bg-[#F1F5F3] dark:bg-[#0C3C32] border border-black/5 dark:border-white/5 flex flex-col justify-between">
          <span class="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate">Dépenses</span>
          <span class="text-[11px] sm:text-xs font-bold text-red-500 dark:text-red-400 truncate">{{ monthlyExpenses.toFixed(2) }} €</span>
        </div>
        <div class="p-2 sm:p-2.5 rounded-lg bg-[#F1F5F3] dark:bg-[#0C3C32] border border-black/5 dark:border-white/5 flex flex-col justify-between">
          <span class="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate">Revenus</span>
          <span class="text-[11px] sm:text-xs font-bold text-green-600 dark:text-green-400 truncate">{{ monthlyIncome.toFixed(2) }} €</span>
        </div>
        <div class="p-2 sm:p-2.5 rounded-lg bg-[#F1F5F3] dark:bg-[#0C3C32] border border-black/5 dark:border-white/5 flex flex-col justify-between">
          <span class="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate">Solde</span>
          <span
            class="text-[11px] sm:text-xs font-bold truncate"
            :class="monthlyBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'"
          >
            {{ monthlyBalance >= 0 ? '+' : '' }}{{ monthlyBalance.toFixed(2) }} €
          </span>
        </div>
      </div>

      <UCard>
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass"
          placeholder="Rechercher une transaction..."
          class="w-full sm:w-72"
        />
      </UCard>

      <UCard
        class="flex-1 flex flex-col min-h-0"
        :ui="{ body: 'flex-1 flex flex-col p-0 sm:p-0 min-h-0 overflow-hidden' }"
      >
        <!-- ── VUE MOBILE : Cartes swipeables sans scroll horizontal (< lg) ── -->
        <div class="block lg:hidden flex-1 overflow-y-auto p-3 space-y-2.5">
          <div
            v-if="filteredTransactions.length === 0"
            class="p-8 text-center text-muted"
          >
            <UIcon
              name="i-heroicons-inbox"
              class="w-8 h-8 mx-auto mb-2 opacity-40"
            />
            <p>Aucune transaction trouvée.</p>
          </div>

          <TransactionsMobileSwipeableRow
            v-for="tx in filteredTransactions"
            :id="tx.id"
            :key="tx.id"
            v-model:active-id="activeMobileSwipeId"
            :actions-width="116"
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

              <!-- 2. Centre : Nom + [Compte & Fréquence/Date] -->
              <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                <span class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ tx.name }}
                </span>

                <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span class="truncate">
                    {{ (tx.account as any)?.name }}
                  </span>

                  <span>•</span>

                  <span class="shrink-0 text-[11px] text-gray-400">
                    {{ formatFrequency(tx.frequency) }} • {{ formatDate(tx.startDate) }}
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
                  {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount }} €
                </span>
              </div>
            </div>

            <!-- Actions au swipe : Blocs carrés Supprimer & Modifier -->
            <template #actions>
              <button
                type="button"
                class="w-12 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-95 transition-transform cursor-pointer"
                title="Supprimer la transaction"
                @click.stop="handleDeleteMobileTransaction(tx)"
              >
                <UIcon
                  name="i-heroicons-trash"
                  class="w-4 h-4"
                />
                <span class="text-[10px] font-medium leading-tight">Supprimer</span>
              </button>

              <button
                type="button"
                class="w-12 h-12 rounded-xl bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-800 dark:text-gray-100 border border-black/5 dark:border-white/10 flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-95 transition-transform cursor-pointer"
                title="Modifier la transaction"
                @click.stop="handleEditMobileTransaction(tx)"
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

        <!-- ── VUE DESKTOP : Tableau complet (>= lg) ── -->
        <div class="hidden lg:block flex-1 overflow-x-auto">
          <UTable
            v-model:sorting="sorting"
            :data="filteredTransactions"
            :columns="columns"
            class="flex-1 min-w-[580px]"
            sticky
            :ui="{ thead: 'bg-gray-50/90 dark:bg-[#11463B]/90 backdrop-blur-md' }"
          >
            <!-- Les headers triables sont définis via sortableHeader() dans le script -->
            <!-- Cells -->
            <template #startDate-cell="{ row }">
              {{ formatDate(getRow(row).startDate as string) }}
              <span
                v-if="getRow(row).endDate"
                class="text-gray-500 text-xs ml-1"
              >au {{ formatDate(getRow(row).endDate as string) }}</span>
            </template>
            <template #frequency-cell="{ row }">
              {{ formatFrequency(getRow(row).frequency as string) }}
            </template>
            <template #type-cell="{ row }">
              <UBadge
                :color="getRow(row).type === 'income' ? 'success' : 'error'"
                variant="subtle"
              >
                {{ TRANSACTION_TYPE_LABELS[getRow(row).type as 'income' | 'expense'] }}
              </UBadge>
            </template>
            <template #account-cell="{ row }">
              {{ (getRow(row).account as any)?.name }}
            </template>
            <template #amount-cell="{ row }">
              <span :class="getRow(row).type === 'income' ? 'text-green-600' : 'text-red-400'">
                {{ getRow(row).type === 'income' ? '+' : '-' }}{{ getRow(row).amount }} €
              </span>
            </template>
            <template #actions-cell="{ row }">
              <UDropdownMenu :items="getDropdownItems(row)">
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-ellipsis-horizontal"
                  size="xs"
                />
              </UDropdownMenu>
            </template>
          </UTable>
        </div>
      </UCard>
    </div>

    <AppModal
      v-model:open="isModalOpen"
      title="Nouvelle transaction"
    >
      <TransactionsTransactionForm
        v-if="isModalOpen"
        @close="closeModal"
        @success="handleSuccess"
      />
    </AppModal>

    <!-- Modale d'édition de transaction -->
    <AppModal
      v-model:open="isEditModalOpen"
      title="Modifier la transaction"
    >
      <TransactionsTransactionForm
        v-if="isEditModalOpen && editingTransaction"
        :transaction="editingTransaction"
        @close="closeEditModal"
        @success="handleEditSuccess"
      />
    </AppModal>

    <!-- Modale de confirmation de suppression de transaction -->
    <AppModal
      v-model:open="isDeleteModalOpen"
      title="Confirmer la suppression"
      icon="i-heroicons-exclamation-triangle"
      confirm-label="Oui, supprimer"
      confirm-color="error"
      :loading="deleteLoading"
      @confirm="confirmDeleteTransaction"
      @cancel="closeDeleteModal"
    >
      <p class="text-gray-600 dark:text-gray-300 text-sm">
        Êtes-vous sûr de vouloir supprimer la transaction <strong class="text-gray-900 dark:text-white">« {{ transactionToDelete?.name }} »</strong> ?
      </p>
    </AppModal>
  </UDashboardPanel>
</template>
