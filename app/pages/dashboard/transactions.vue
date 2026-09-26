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
  archivedAt?: string | null
  account: { id: string, name: string }
}

const showArchived = ref(false)
const toggleShowArchived = () => {
  showArchived.value = !showArchived.value
}

const isTransactionExpired = (tx: { endDate?: string | null }) => {
  if (!tx.endDate) return false
  const end = new Date(tx.endDate)
  end.setHours(23, 59, 59, 999)
  return end < new Date()
}

const { data: transactions, refresh } = await useFetch<Transaction[]>('/api/transactions', {
  query: computed(() => ({
    archived: showArchived.value ? 'true' : 'false'
  }))
})

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

// --- Archivage des transactions ---
const archiveLoading = ref(false)
const transactionToArchive = ref<Transaction | null>(null)
const isArchiveModalOpen = ref(false)

const openArchiveModal = (transaction: Transaction) => {
  transactionToArchive.value = transaction
  isArchiveModalOpen.value = true
}

const closeArchiveModal = () => {
  isArchiveModalOpen.value = false
  transactionToArchive.value = null
}

async function confirmArchiveTransaction() {
  if (!transactionToArchive.value) return
  archiveLoading.value = true
  const isCurrentlyArchived = !!transactionToArchive.value.archivedAt
  try {
    await $fetch(`/api/transactions/${transactionToArchive.value.id}/archive`, {
      method: 'PATCH',
      body: { archive: !isCurrentlyArchived }
    })
    toast.add({
      title: isCurrentlyArchived ? 'Transaction désarchivée' : 'Transaction archivée',
      description: isCurrentlyArchived
        ? 'La transaction est à nouveau active.'
        : 'La transaction a été archivée.',
      color: 'success'
    })
    closeArchiveModal()
    refresh()
  } catch {
    toast.add({
      title: 'Erreur',
      description: isCurrentlyArchived
        ? 'Impossible de désarchiver la transaction'
        : 'Impossible d\'archiver la transaction',
      color: 'error'
    })
  } finally {
    archiveLoading.value = false
  }
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

const handleArchiveMobileTransaction = (tx: Transaction) => {
  activeMobileSwipeId.value = null
  openArchiveModal(tx)
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

const getDropdownItems = (row: unknown) => {
  const tx = getRow(row) as unknown as Transaction
  const isArchived = !!tx.archivedAt

  return [
    [
      {
        label: 'Éditer',
        icon: 'i-heroicons-pencil-square',
        onSelect: () => {
          openEditModal(tx)
        }
      },
      {
        label: isArchived ? 'Désarchiver' : 'Archiver',
        icon: isArchived ? 'i-heroicons-arrow-uturn-left' : 'i-heroicons-archive-box',
        onSelect: () => {
          openArchiveModal(tx)
        }
      }
    ],
    [
      {
        label: 'Supprimer',
        icon: 'i-heroicons-trash',
        color: 'error' as const,
        onSelect: () => {
          openDeleteModal(tx)
        }
      }
    ]
  ]
}
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
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <UInput
            v-model="search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Rechercher une transaction..."
            class="w-full sm:w-72"
          />

          <div class="flex items-center gap-2">
            <UButton
              :color="showArchived ? 'primary' : 'neutral'"
              :variant="showArchived ? 'solid' : 'outline'"
              :icon="showArchived ? 'i-heroicons-arrow-uturn-left' : 'i-heroicons-archive-box'"
              size="sm"
              @click="toggleShowArchived"
            >
              {{ showArchived ? 'Voir les transactions actives' : 'Afficher les archivées' }}
            </UButton>
          </div>
        </div>
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
            :actions-width="170"
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
                <div class="flex items-center gap-1.5">
                  <span class="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {{ tx.name }}
                  </span>
                  <UBadge
                    v-if="tx.archivedAt"
                    size="xs"
                    color="neutral"
                    variant="subtle"
                    class="shrink-0"
                  >
                    {{ isTransactionExpired(tx) ? 'Terminée' : 'Archivée' }}
                  </UBadge>
                </div>

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

            <!-- Actions au swipe : Blocs carrés Supprimer, Archiver & Modifier -->
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
                class="w-12 h-12 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-95 transition-transform cursor-pointer"
                :title="tx.archivedAt ? 'Désarchiver la transaction' : 'Archiver la transaction'"
                @click.stop="handleArchiveMobileTransaction(tx)"
              >
                <UIcon
                  :name="tx.archivedAt ? 'i-heroicons-arrow-uturn-left' : 'i-heroicons-archive-box'"
                  class="w-4 h-4"
                />
                <span class="text-[10px] font-medium leading-tight">{{ tx.archivedAt ? 'Restaurer' : 'Archiver' }}</span>
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
            <template #name-cell="{ row }">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-900 dark:text-white">{{ getRow(row).name }}</span>
                <UBadge
                  v-if="getRow(row).archivedAt"
                  size="xs"
                  color="neutral"
                  variant="subtle"
                >
                  {{ isTransactionExpired(getRow(row)) ? 'Terminée' : 'Archivée' }}
                </UBadge>
              </div>
            </template>
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

    <!-- Modale de confirmation d'archivage / désarchivage -->
    <AppModal
      v-model:open="isArchiveModalOpen"
      :title="transactionToArchive?.archivedAt ? 'Confirmer le désarchivage' : 'Confirmer l\'archivage'"
      :icon="transactionToArchive?.archivedAt ? 'i-heroicons-arrow-uturn-left' : 'i-heroicons-archive-box'"
      icon-class="text-amber-500"
      :confirm-label="transactionToArchive?.archivedAt ? 'Oui, désarchiver' : 'Oui, archiver'"
      :confirm-color="transactionToArchive?.archivedAt ? 'primary' : 'warning'"
      :loading="archiveLoading"
      @confirm="confirmArchiveTransaction"
      @cancel="closeArchiveModal"
    >
      <p class="text-gray-600 dark:text-gray-300 text-sm">
        <template v-if="transactionToArchive?.archivedAt">
          Êtes-vous sûr de vouloir désarchiver la transaction <strong class="text-gray-900 dark:text-white">« {{ transactionToArchive?.name }} »</strong> ? Elle réapparaîtra dans votre liste active de transactions et ses itérations futures seront réactivées.
        </template>
        <template v-else>
          Êtes-vous sûr de vouloir archiver la transaction <strong class="text-gray-900 dark:text-white">« {{ transactionToArchive?.name }} »</strong> ? Elle ne sera plus visible dans votre liste active et sera exclue des flux futurs.
        </template>
      </p>
    </AppModal>
  </UDashboardPanel>
</template>
