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

const totalExpenses = computed(() => {
  return filteredTransactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

const totalIncome = computed(() => {
  return filteredTransactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

const balance = computed(() => {
  return totalIncome.value - totalExpenses.value
})

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
        <div class="flex items-center gap-6 text-sm mr-2 border-r border-gray-200 dark:border-gray-800 pr-6">
          <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <UIcon
              name="i-heroicons-arrow-down-left"
              class="w-4 h-4 text-red-400"
            />
            Dépenses: <span class="font-semibold text-gray-900 dark:text-white">{{ totalExpenses.toFixed(2) }} €</span>
          </div>
          <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <UIcon
              name="i-heroicons-arrow-up-right"
              class="w-4 h-4 text-green-500"
            />
            Revenus: <span class="font-semibold text-gray-900 dark:text-white">{{ totalIncome.toFixed(2) }} €</span>
          </div>
          <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <UIcon
              name="i-heroicons-arrows-right-left"
              class="w-4 h-4 text-blue-500"
            />
            Solde: <span class="font-semibold text-gray-900 dark:text-white">{{ balance.toFixed(2) }} €</span>
          </div>
        </div>

        <UButton
          icon="i-heroicons-plus"
          color="primary"
          @click="openModal"
        >
          Ajouter une transaction
        </UButton>
      </template>
    </UDashboardNavbar>

    <div class="flex flex-col gap-4 p-4 h-full overflow-hidden">
      <UCard>
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass"
          placeholder="Rechercher une transaction..."
          class="w-72 max-w-full"
        />
      </UCard>

      <UCard
        class="flex-1 flex flex-col min-h-0"
        :ui="{ body: 'flex-1 overflow-hidden flex flex-col p-0 sm:p-0' }"
      >
        <UTable
          v-model:sorting="sorting"
          :data="filteredTransactions"
          :columns="columns"
          class="flex-1 overflow-auto"
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
