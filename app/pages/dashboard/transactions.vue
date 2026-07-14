<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

interface Transaction {
  id: string
  name: string
  startDate: string
  endDate: string | null
  frequency: string
  type: string
  amount: string
  account: { name: string }
}

const { data: transactions, refresh } = await useFetch<Transaction[]>('/api/transactions')

const isModalOpen = ref(false)
const search = ref('')
const sorting = ref([])

const columns = [
  { accessorKey: 'name', header: 'Libellé' },
  { accessorKey: 'startDate', header: 'Date' },
  { accessorKey: 'frequency', header: 'Fréquence' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'account', header: 'Compte' },
  { accessorKey: 'amount', header: 'Montant' },
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

async function deleteTransaction(id: string) {
  try {
    await $fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Transaction supprimée', color: 'success' })
    refresh()
  } catch {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de supprimer la transaction',
      color: 'error'
    })
  }
}

function handleSuccess() {
  isModalOpen.value = false
  refresh()
}

const getRow = (row: unknown): Record<string, unknown> => (row as { original?: Record<string, unknown> }).original || (row as Record<string, unknown>)

const getDropdownItems = (row: unknown) => [
  [
    {
      label: 'Éditer',
      icon: 'i-heroicons-pencil-square',
      onSelect: () => {
        toast.add({ title: 'Bientôt disponible', description: 'L\'édition de transaction sera implémentée prochainement.', color: 'info' })
      }
    }
  ],
  [
    {
      label: 'Supprimer',
      icon: 'i-heroicons-trash',
      color: 'error' as const,
      onSelect: () => deleteTransaction(getRow(row).id as string)
    }
  ]
]

const formatDate = (dateString: string) => {
  const d = new Date(dateString)
  return d.toLocaleDateString('fr-FR')
}

const formatFrequency = (freq: string) => {
  const map: Record<string, string> = {
    once: 'Unique',
    monthly: 'Mensuel',
    quarterly: 'Trimestriel',
    yearly: 'Annuel'
  }
  return map[freq] || freq
}

const openModal = () => {
  isModalOpen.value = true
}
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
      <UCard
        class="flex-1 flex flex-col min-h-0"
        :ui="{ body: 'flex-1 overflow-hidden flex flex-col p-0 sm:p-0' }"
      >
        <UDashboardToolbar>
          <template #left>
            <UInput
              v-model="search"
              icon="i-heroicons-magnifying-glass"
              placeholder="Rechercher une transaction..."
              class="w-72"
            />
          </template>
        </UDashboardToolbar>

        <div class="flex-1 overflow-auto">
          <UTable
            v-model:sorting="sorting"
            :data="filteredTransactions"
            :columns="columns"
            class="w-full"
          >
            <!-- Headers -->
            <template #name-header="{ column }">
              <UButton
                variant="ghost"
                color="neutral"
                class="-ml-2.5"
                :icon="column.getIsSorted() ? (column.getIsSorted() === 'desc' ? 'i-heroicons-bars-arrow-down' : 'i-heroicons-bars-arrow-up') : 'i-heroicons-arrows-up-down'"
                @click="column.toggleSorting(column.getIsSorted() === 'asc')"
              >
                {{ column.columnDef.header }}
              </UButton>
            </template>
            <template #startDate-header="{ column }">
              <UButton
                variant="ghost"
                color="neutral"
                class="-ml-2.5"
                :icon="column.getIsSorted() ? (column.getIsSorted() === 'desc' ? 'i-heroicons-bars-arrow-down' : 'i-heroicons-bars-arrow-up') : 'i-heroicons-arrows-up-down'"
                @click="column.toggleSorting(column.getIsSorted() === 'asc')"
              >
                {{ column.columnDef.header }}
              </UButton>
            </template>
            <template #frequency-header="{ column }">
              <UButton
                variant="ghost"
                color="neutral"
                class="-ml-2.5"
                :icon="column.getIsSorted() ? (column.getIsSorted() === 'desc' ? 'i-heroicons-bars-arrow-down' : 'i-heroicons-bars-arrow-up') : 'i-heroicons-arrows-up-down'"
                @click="column.toggleSorting(column.getIsSorted() === 'asc')"
              >
                {{ column.columnDef.header }}
              </UButton>
            </template>
            <template #type-header="{ column }">
              <UButton
                variant="ghost"
                color="neutral"
                class="-ml-2.5"
                :icon="column.getIsSorted() ? (column.getIsSorted() === 'desc' ? 'i-heroicons-bars-arrow-down' : 'i-heroicons-bars-arrow-up') : 'i-heroicons-arrows-up-down'"
                @click="column.toggleSorting(column.getIsSorted() === 'asc')"
              >
                {{ column.columnDef.header }}
              </UButton>
            </template>
            <template #account-header="{ column }">
              <UButton
                variant="ghost"
                color="neutral"
                class="-ml-2.5"
                :icon="column.getIsSorted() ? (column.getIsSorted() === 'desc' ? 'i-heroicons-bars-arrow-down' : 'i-heroicons-bars-arrow-up') : 'i-heroicons-arrows-up-down'"
                @click="column.toggleSorting(column.getIsSorted() === 'asc')"
              >
                {{ column.columnDef.header }}
              </UButton>
            </template>
            <template #amount-header="{ column }">
              <UButton
                variant="ghost"
                color="neutral"
                class="-ml-2.5"
                :icon="column.getIsSorted() ? (column.getIsSorted() === 'desc' ? 'i-heroicons-bars-arrow-down' : 'i-heroicons-bars-arrow-up') : 'i-heroicons-arrows-up-down'"
                @click="column.toggleSorting(column.getIsSorted() === 'asc')"
              >
                {{ column.columnDef.header }}
              </UButton>
            </template>
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
                {{ getRow(row).type === 'income' ? 'Revenu' : 'Dépense' }}
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

    <UModal v-model:open="isModalOpen">
      <template #header>
        <h3 class="font-semibold text-lg">
          Nouvelle transaction
        </h3>
      </template>
      <template #body>
        <TransactionsTransactionForm
          @close="isModalOpen = false"
          @success="handleSuccess"
        />
      </template>
    </UModal>
  </UDashboardPanel>
</template>
