<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

definePageMeta({ layout: 'dashboard' })

interface AccountItem {
  id: string
  name: string
  icon?: string | null
  color?: string | null
  isMain: boolean
  createdAt?: string
}

const AVAILABLE_ICONS = [
  { id: 'i-heroicons-building-library', label: 'Banque' },
  { id: 'i-heroicons-credit-card', label: 'Carte' },
  { id: 'i-heroicons-wallet', label: 'Portefeuille' },
  { id: 'i-simple-icons-bitcoin', label: 'Bitcoin' },
  { id: 'i-simple-icons-ethereum', label: 'Ethereum' },
  { id: 'i-lucide-coins', label: 'Crypto / Jetons' },
  { id: 'i-heroicons-banknotes', label: 'Espèces' },
  { id: 'i-heroicons-currency-euro', label: 'Euro' },
  { id: 'i-heroicons-currency-dollar', label: 'Dollar' },
  { id: 'i-heroicons-circle-stack', label: 'Épargne' },
  { id: 'i-heroicons-arrow-trending-up', label: 'Investissement' },
  { id: 'i-heroicons-chart-pie', label: 'Budget' },
  { id: 'i-heroicons-globe-alt', label: 'International' },
  { id: 'i-heroicons-shopping-bag', label: 'Achats' },
  { id: 'i-heroicons-sparkles', label: 'Autre' }
]

const { data: accounts, refresh } = await useFetch<AccountItem[]>('/api/accounts')
const toast = useToast()

const search = ref('')
const loading = ref(false)

// Modales
const isCreateOpen = ref(false)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)

const formState = reactive({
  id: '',
  name: '',
  icon: 'i-heroicons-building-library'
})
const accountToDelete = ref<AccountItem | null>(null)

// Filtrage
const filteredAccounts = computed(() => {
  if (!accounts.value) return []
  if (!search.value.trim()) return accounts.value
  const query = search.value.toLowerCase()
  return accounts.value.filter(acc => acc.name.toLowerCase().includes(query))
})

const columns = [
  { accessorKey: 'name', header: 'Nom du compte' },
  { accessorKey: 'isMain', header: 'Statut' },
  { id: 'actions', header: '' }
]

const selectIcon = (iconId: string) => {
  formState.icon = iconId
}

const openCreateModal = () => {
  formState.id = ''
  formState.name = ''
  formState.icon = 'i-heroicons-building-library'
  isCreateOpen.value = true
}

const closeCreateModal = () => {
  isCreateOpen.value = false
}

const createAccount = async () => {
  if (!formState.name.trim()) return
  loading.value = true
  try {
    await $fetch('/api/accounts', {
      method: 'POST',
      body: {
        name: formState.name.trim(),
        icon: formState.icon,
        color: 'emerald'
      }
    })
    closeCreateModal()
    await refresh()
    toast.add({ title: 'Compte créé avec succès', color: 'success' })
  } catch (error) {
    console.error('Erreur création compte', error)
  } finally {
    loading.value = false
  }
}

const openEditModal = (account: AccountItem) => {
  formState.id = account.id
  formState.name = account.name
  formState.icon = account.icon || 'i-heroicons-building-library'
  isEditOpen.value = true
}

const closeEditModal = () => {
  isEditOpen.value = false
}

const updateAccount = async () => {
  if (!formState.name.trim() || !formState.id) return
  loading.value = true
  try {
    await $fetch(`/api/accounts/${formState.id}`, {
      method: 'PUT',
      body: {
        name: formState.name.trim(),
        icon: formState.icon
      }
    })
    closeEditModal()
    await refresh()
    toast.add({ title: 'Compte mis à jour avec succès', color: 'success' })
  } catch (error) {
    console.error('Erreur mise à jour compte', error)
  } finally {
    loading.value = false
  }
}

const setAsMain = async (id: string) => {
  try {
    await $fetch(`/api/accounts/${id}`, {
      method: 'PUT',
      body: { isMain: true }
    })
    await refresh()
    toast.add({
      title: 'Défini comme compte principal',
      color: 'success'
    })
  } catch (error) {
    console.error('Erreur mise à jour compte principal', error)
  }
}

const confirmDelete = (account: AccountItem) => {
  accountToDelete.value = account
  isDeleteOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteOpen.value = false
  accountToDelete.value = null
}

const deleteAccount = async () => {
  if (!accountToDelete.value) return
  loading.value = true
  try {
    await $fetch(`/api/accounts/${accountToDelete.value.id}`, {
      method: 'DELETE'
    })
    closeDeleteModal()
    await refresh()
    toast.add({ title: 'Compte supprimé', color: 'success' })
  } catch (error) {
    console.error('Erreur suppression compte', error)
  } finally {
    loading.value = false
  }
}

const getRow = (row: Row<AccountItem> | AccountItem): AccountItem => {
  return 'original' in row ? row.original : row
}

const items = (row: Row<AccountItem> | AccountItem) => {
  const item = getRow(row)
  return [
    [
      {
        label: 'Modifier',
        icon: 'i-heroicons-pencil-square',
        onSelect: () => openEditModal(item)
      },
      {
        label: 'Définir comme principal',
        icon: 'i-heroicons-star',
        disabled: Boolean(item.isMain),
        onSelect: () => setAsMain(item.id)
      }
    ],
    [
      {
        label: 'Supprimer',
        icon: 'i-heroicons-trash',
        color: 'error' as const,
        onSelect: () => confirmDelete(item)
      }
    ]
  ]
}
</script>

<template>
  <UDashboardPanel id="accounts">
    <UDashboardNavbar title="Mes Comptes">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>

      <template #right>
        <div class="flex items-center gap-3">
          <div class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            {{ (accounts || []).length }} compte{{ (accounts || []).length > 1 ? 's' : '' }}
          </div>
          <UButton
            icon="i-heroicons-plus"
            label="Nouveau compte"
            color="primary"
            class="cursor-pointer"
            @click="openCreateModal"
          />
        </div>
      </template>
    </UDashboardNavbar>

    <div class="flex flex-col gap-4 p-4 sm:p-6 max-w-6xl w-full mx-auto">
      <UCard>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <UInput
            v-model="search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Rechercher un compte..."
            class="w-full sm:max-w-sm"
          />
        </div>
      </UCard>

      <UCard class="overflow-hidden">
        <UTable
          :columns="columns"
          :data="filteredAccounts"
          class="w-full"
        >
          <template #name-cell="{ row }">
            <div class="flex items-center gap-3 py-1">
              <div class="w-9 h-9 rounded-lg bg-[#0A332C]/10 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                <UIcon
                  :name="getRow(row).icon || 'i-heroicons-building-library'"
                  class="w-5 h-5 text-[#0A332C] dark:text-[#50E8A8]"
                />
              </div>
              <div class="flex flex-col">
                <span class="font-semibold text-gray-900 dark:text-white">{{ getRow(row).name }}</span>
                <span
                  v-if="getRow(row).isMain"
                  class="text-xs text-gray-500 dark:text-gray-400 sm:hidden"
                >Compte principal</span>
              </div>
            </div>
          </template>

          <template #isMain-cell="{ row }">
            <div class="hidden sm:flex items-center">
              <UBadge
                v-if="getRow(row).isMain"
                color="primary"
                variant="subtle"
                icon="i-heroicons-star"
                size="sm"
              >
                Principal
              </UBadge>
              <span
                v-else
                class="text-xs text-gray-400 dark:text-gray-500"
              >—</span>
            </div>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex justify-end">
              <UDropdownMenu
                :items="items(row)"
                :content="{ side: 'left', align: 'start' }"
              >
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-ellipsis-horizontal-20-solid"
                  class="cursor-pointer"
                />
              </UDropdownMenu>
            </div>
          </template>

          <template #empty>
            <div class="flex flex-col items-center justify-center py-12 text-center">
              <div class="w-12 h-12 rounded-full bg-[#0A332C]/10 dark:bg-white/10 flex items-center justify-center mb-3">
                <UIcon
                  name="i-heroicons-building-library"
                  class="w-6 h-6 text-[#0A332C] dark:text-[#50E8A8]"
                />
              </div>
              <p class="font-medium text-gray-900 dark:text-white text-base mb-1">
                Aucun compte trouvé
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">
                {{ search ? 'Aucun résultat ne correspond à votre recherche.' : 'Commencez par ajouter votre premier compte bancaire.' }}
              </p>
              <UButton
                v-if="!search"
                icon="i-heroicons-plus"
                label="Ajouter un compte"
                color="primary"
                @click="openCreateModal"
              />
            </div>
          </template>
        </UTable>
      </UCard>

      <!-- Modal Création -->
      <AppModal
        v-model:open="isCreateOpen"
        title="Nouveau compte"
        confirm-label="Créer le compte"
        confirm-color="primary"
        :loading="loading"
        @confirm="createAccount"
        @cancel="closeCreateModal"
      >
        <form
          class="space-y-5"
          @submit.prevent="createAccount"
        >
          <UFormField label="Nom du compte">
            <UInput
              v-model="formState.name"
              placeholder="Ex: Revolut, BoursoBank, Compte Courant..."
              required
              autofocus
              class="w-full"
            />
          </UFormField>

          <UFormField label="Icône">
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="iconItem in AVAILABLE_ICONS"
                :key="iconItem.id"
                type="button"
                :title="iconItem.label"
                class="flex items-center justify-center h-11 rounded-lg border transition-all cursor-pointer"
                :class="formState.icon === iconItem.id
                  ? '!bg-[#0A332C] !text-white !border-[#0A332C] dark:!bg-[#0A332C] dark:!text-white'
                  : 'bg-white/60 dark:bg-black/25 text-gray-700 dark:text-gray-300 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'"
                @click="selectIcon(iconItem.id)"
              >
                <UIcon
                  :name="iconItem.id"
                  class="w-5 h-5"
                />
              </button>
            </div>
          </UFormField>
        </form>
      </AppModal>

      <!-- Modal Édition -->
      <AppModal
        v-model:open="isEditOpen"
        title="Modifier le compte"
        confirm-label="Enregistrer"
        confirm-color="primary"
        :loading="loading"
        @confirm="updateAccount"
        @cancel="closeEditModal"
      >
        <form
          class="space-y-5"
          @submit.prevent="updateAccount"
        >
          <UFormField label="Nom du compte">
            <UInput
              v-model="formState.name"
              placeholder="Ex: Revolut, BoursoBank..."
              required
              autofocus
              class="w-full"
            />
          </UFormField>

          <UFormField label="Icône">
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="iconItem in AVAILABLE_ICONS"
                :key="iconItem.id"
                type="button"
                :title="iconItem.label"
                class="flex items-center justify-center h-11 rounded-lg border transition-all cursor-pointer"
                :class="formState.icon === iconItem.id
                  ? '!bg-[#0A332C] !text-white !border-[#0A332C] dark:!bg-[#0A332C] dark:!text-white'
                  : 'bg-white/60 dark:bg-black/25 text-gray-700 dark:text-gray-300 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'"
                @click="selectIcon(iconItem.id)"
              >
                <UIcon
                  :name="iconItem.id"
                  class="w-5 h-5"
                />
              </button>
            </div>
          </UFormField>
        </form>
      </AppModal>

      <!-- Modal Suppression -->
      <AppModal
        v-model:open="isDeleteOpen"
        title="Confirmer la suppression"
        icon="i-heroicons-exclamation-triangle"
        confirm-label="Oui, supprimer"
        confirm-color="error"
        :loading="loading"
        @confirm="deleteAccount"
        @cancel="closeDeleteModal"
      >
        <p class="text-gray-600 dark:text-gray-300 text-sm">
          Êtes-vous sûr de vouloir supprimer le compte <strong class="text-gray-900 dark:text-white">{{ accountToDelete?.name }}</strong> ? Toutes les transactions et flux associés seront également supprimés.
        </p>
      </AppModal>
    </div>
  </UDashboardPanel>
</template>
