<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { data: accounts, refresh } = await useFetch('/api/accounts')
const toast = useToast()

const columns = [
  { accessorKey: 'name', header: 'Compte' },
  { accessorKey: 'isMain', header: 'Statut' },
  { id: 'actions' }
]

const newAccountName = ref('')
const loading = ref(false)

const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const formState = reactive({
  id: '',
  name: ''
})
const accountToDelete = ref('')

const createAccount = async () => {
  if (!newAccountName.value.trim()) return
  loading.value = true
  try {
    await $fetch('/api/accounts', {
      method: 'POST',
      body: {
        name: newAccountName.value,
        icon: 'i-heroicons-building-library',
        color: 'blue'
      }
    })
    newAccountName.value = ''
    await refresh()
    toast.add({ title: 'Compte créé avec succès', color: 'success' })
  } catch (error) {
    console.error('Erreur création compte', error)
  } finally {
    loading.value = false
  }
}

const openEditModal = (account: { id: string, name: string }) => {
  formState.id = account.id
  formState.name = account.name
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
      body: { name: formState.name }
    })
    isEditOpen.value = false
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

const confirmDelete = (id: string) => {
  accountToDelete.value = id
  isDeleteOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteOpen.value = false
}

const deleteAccount = async () => {
  if (!accountToDelete.value) return
  loading.value = true
  try {
    await $fetch(`/api/accounts/${accountToDelete.value}`, {
      method: 'DELETE'
    })
    isDeleteOpen.value = false
    await refresh()
    toast.add({ title: 'Compte supprimé', color: 'success' })
  } catch (error) {
    console.error('Erreur suppression compte', error)
  } finally {
    loading.value = false
  }
}

const items = (row: { id: string, name: string, isMain: boolean }) => [
  [
    {
      label: 'Modifier',
      icon: 'i-heroicons-pencil-square',
      onSelect: () => openEditModal(row)
    },
    {
      label: 'Définir comme principal',
      icon: 'i-heroicons-star',
      disabled: Boolean(row.isMain),
      onSelect: () => setAsMain(row.id)
    }
  ],
  [
    {
      label: 'Supprimer',
      icon: 'i-heroicons-trash',
      color: 'error' as const,
      onSelect: () => confirmDelete(row.id)
    }
  ]
]
</script>

<template>
  <UDashboardPanel id="accounts">
    <UDashboardNavbar title="Mes Comptes">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
    </UDashboardNavbar>
    <div class="space-y-4 sm:space-y-6 max-w-5xl mx-auto w-full">
      <UCard id="plop">
        <template #header>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full">
            <UInput
              v-model="newAccountName"
              placeholder="Nom du nouveau compte (ex: Perso SG...)"
              class="flex-1"
              @keyup.enter="createAccount"
            />
            <UButton
              icon="i-heroicons-plus"
              label="Créer"
              color="primary"
              :loading="loading"
              :disabled="!newAccountName.trim()"
              class="w-full justify-center sm:w-auto"
              @click="createAccount"
            />
          </div>
        </template>

        <UTable
          :columns="columns"
          :data="accounts || []"
        >
          <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
              <UIcon
                :name="row.original.icon || 'i-heroicons-building-library'"
                class="w-5 h-5 flex-shrink-0"
                :class="`text-${row.original.color || 'blue'}-500`"
              />
              <span class="font-semibold">{{ row.original.name }}</span>
            </div>
          </template>

          <template #isMain-cell="{ row }">
            <div>
              <UBadge
                v-if="row.original.isMain"
                color="warning"
                variant="subtle"
                icon="i-heroicons-star"
              >
                Principal
              </UBadge>
            </div>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex justify-end">
              <UDropdownMenu
                :items="items(row.original)"
                :content="{ side: 'left', align: 'start' }"
              >
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-ellipsis-horizontal-20-solid"
                />
              </UDropdownMenu>
            </div>
          </template>
        </UTable>
      </UCard>

      <!-- Modal Édition -->
      <UModal v-model:open="isEditOpen">
        <template #content>
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">
                Modifier le compte
              </h3>
            </template>
            <form
              class="space-y-4"
              @submit.prevent="updateAccount"
            >
              <UFormField label="Nom du compte">
                <UInput
                  v-model="formState.name"
                  required
                  autofocus
                />
              </UFormField>
              <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-0 sm:space-x-3 pt-4">
                <UButton
                  label="Annuler"
                  color="neutral"
                  variant="ghost"
                  class="w-full justify-center sm:w-auto"
                  @click="closeEditModal"
                />
                <UButton
                  type="submit"
                  label="Sauvegarder"
                  color="primary"
                  :loading="loading"
                  class="w-full justify-center sm:w-auto"
                />
              </div>
            </form>
          </UCard>
        </template>
      </UModal>

      <!-- Modal Suppression -->
      <UModal v-model:open="isDeleteOpen">
        <template #content>
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-red-500 flex items-center gap-2">
                <UIcon
                  name="i-heroicons-exclamation-triangle"
                  class="w-5 h-5"
                />
                Confirmer la suppression
              </h3>
            </template>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-300">
                Êtes-vous sûr de vouloir supprimer ce compte ? Toutes les dépenses, flux et règles de transferts qui y sont liés seront définitivement supprimés de la base de données.
              </p>
              <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-0 sm:space-x-3 pt-4">
                <UButton
                  label="Annuler"
                  color="neutral"
                  variant="ghost"
                  class="w-full justify-center sm:w-auto"
                  @click="closeDeleteModal"
                />
                <UButton
                  label="Oui, supprimer"
                  color="error"
                  :loading="loading"
                  class="w-full justify-center sm:w-auto"
                  @click="deleteAccount"
                />
              </div>
            </div>
          </UCard>
        </template>
      </UModal>
    </div>
  </UDashboardPanel>
</template>
