<script setup lang="ts">
const { data: accounts, refresh } = await useFetch('/api/accounts')
const toast = useToast()

const columns = [
  { accessorKey: 'icon', header: '' },
  { accessorKey: 'name', header: 'Nom du compte' },
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

const openEditModal = (account: any) => {
  formState.id = account.id
  formState.name = account.name
  isEditOpen.value = true
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

const items = (row: any) => [
  [
    {
      label: 'Modifier',
      icon: 'i-heroicons-pencil-square',
      onSelect: () => openEditModal(row)
    },
    {
      label: 'Définir comme principal',
      icon: 'i-heroicons-star',
      disabled: row.isMain,
      onSelect: () => setAsMain(row.id)
    }
  ],
  [
    {
      label: 'Supprimer',
      icon: 'i-heroicons-trash',
      color: 'error',
      onSelect: () => confirmDelete(row.id)
    }
  ]
]
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 p-8">
    <div class="mb-4">
      <UButton to="/dashboard" color="neutral" variant="ghost" icon="i-lucide-arrow-left">
        Retour au Dashboard
      </UButton>
    </div>
    
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Mes Comptes</h1>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center gap-4 w-full">
          <UInput 
            v-model="newAccountName" 
            placeholder="Nom du nouveau compte (ex: Perso SG, Revolut...)" 
            class="flex-1" 
            @keyup.enter="createAccount"
          />
          <UButton 
            icon="i-heroicons-plus" 
            label="Créer" 
            color="primary"
            :loading="loading"
            :disabled="!newAccountName.trim()"
            @click="createAccount" 
          />
        </div>
      </template>

      <UTable :columns="columns" :data="accounts || []">
        <template #icon-cell="{ row }">
          <UIcon :name="row.original.icon || 'i-heroicons-building-library'" class="w-6 h-6" :class="`text-${row.original.color || 'blue'}-500`" />
        </template>
        
        <template #name-cell="{ row }">
          <span class="font-semibold">{{ row.original.name }}</span>
        </template>
        
        <template #isMain-cell="{ row }">
          <div>
            <UBadge v-if="row.original.isMain" color="warning" variant="subtle" icon="i-heroicons-star">Principal</UBadge>
          </div>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end">
            <UDropdownMenu :items="items(row.original)">
              <UButton color="neutral" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
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
            <h3 class="text-lg font-semibold">Modifier le compte</h3>
          </template>
          <form @submit.prevent="updateAccount" class="space-y-4">
            <UFormField label="Nom du compte">
              <UInput v-model="formState.name" required autofocus />
            </UFormField>
            <div class="flex justify-end space-x-3 pt-4">
              <UButton label="Annuler" color="neutral" variant="ghost" @click="isEditOpen = false" />
              <UButton type="submit" label="Sauvegarder" color="primary" :loading="loading" />
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
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5" />
              Confirmer la suppression
            </h3>
          </template>
          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-300">
              Êtes-vous sûr de vouloir supprimer ce compte ? Toutes les dépenses, flux et règles de transferts qui y sont liés seront définitivement supprimés de la base de données.
            </p>
            <div class="flex justify-end space-x-3 pt-4">
              <UButton label="Annuler" color="neutral" variant="ghost" @click="isDeleteOpen = false" />
              <UButton label="Oui, supprimer" color="error" :loading="loading" @click="deleteAccount" />
            </div>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
