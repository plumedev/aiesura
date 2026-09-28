<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const toast = useToast()
const user = useSupabaseUser()
const onboardedStateMap = useState<Record<string, boolean>>('users-onboarded-map', () => ({}))
const loading = ref(false)

const handleForceOnboarding = async () => {
  if (!user.value) return
  loading.value = true
  try {
    await $fetch('/api/profile/reset-onboarding', { method: 'POST' })

    // Réinitialiser le cache local pour cet utilisateur
    onboardedStateMap.value[user.value.id] = false

    toast.add({
      title: 'Onboarding réinitialisé',
      description: 'Vous allez être redirigé vers le guide de configuration.',
      color: 'success'
    })

    // Rediriger vers l'onboarding
    navigateTo('/dashboard/onboarding')
  } catch (error) {
    console.error('Erreur lors de la réinitialisation de l\'onboarding:', error)
    toast.add({
      title: 'Erreur',
      description: 'Impossible de réinitialiser l\'onboarding.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
const supabase = useSupabaseClient()
const isDeleteModalOpen = ref(false)
const deleteConfirmationInput = ref('')
const isDeleting = ref(false)

const openDeleteModal = () => {
  deleteConfirmationInput.value = ''
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  deleteConfirmationInput.value = ''
}

const handleDeleteAccount = async () => {
  if (deleteConfirmationInput.value !== 'SUPPRIMER') return
  isDeleting.value = true
  try {
    await $fetch('/api/profile', { method: 'DELETE' })

    toast.add({
      title: 'Compte supprimé',
      description: 'Votre compte et toutes vos données associées ont été définitivement supprimés.',
      color: 'success'
    })

    // Déconnexion et nettoyage
    onboardedStateMap.value = {}
    await supabase.auth.signOut()
    await navigateTo('/')
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la suppression du compte.',
      color: 'error'
    })
  } finally {
    isDeleting.value = false
    closeDeleteModal()
  }
}
</script>

<template>
  <UDashboardPanel id="settings">
    <template #header>
      <UDashboardNavbar title="Paramètres">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            Préférences de l'application
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gérez vos préférences de compte, d'interface et d'intégration.
          </p>
        </div>

        <UCard class="bg-[#F1F5F3] dark:bg-[#0C3C32] border-0">
          <template #header>
            <h3 class="font-bold text-gray-900 dark:text-white">
              Découverte & Guides
            </h3>
          </template>

          <div class="space-y-4">
            <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Si vous souhaitez revoir les étapes d'intégration de l'application (création de comptes, revenus, dépenses et règles de virement), vous pouvez réinitialiser votre progression et relancer le guide interactif d'onboarding.
            </p>

            <div class="flex pt-2">
              <UButton
                icon="i-heroicons-arrow-path"
                label="Forcer l'onboarding"
                color="primary"
                variant="solid"
                :loading="loading"
                @click="handleForceOnboarding"
              />
            </div>
          </div>
        </UCard>

        <!-- ── Zone de danger ── -->
        <UCard class="bg-[#F1F5F3] dark:bg-[#0C3C32] border border-red-500/20">
          <template #header>
            <div class="flex items-center gap-2 text-red-600 dark:text-red-400">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-5 h-5"
              />
              <h3 class="font-bold text-gray-900 dark:text-white">
                Zone de danger
              </h3>
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
                Supprimer mon compte
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                Une fois votre compte supprimé, toutes vos données (comptes bancaires, transactions, règles de virement, planification et historique) seront définitivement effacées. Cette action est irréversible.
              </p>
            </div>

            <div class="flex pt-2">
              <UButton
                icon="i-heroicons-trash"
                label="Supprimer mon compte"
                color="error"
                variant="solid"
                class="cursor-pointer"
                @click="openDeleteModal"
              />
            </div>
          </div>
        </UCard>

        <!-- Modale de confirmation de suppression de compte -->
        <AppModal
          :open="isDeleteModalOpen"
          title="Supprimer définitivement votre compte"
          icon="i-heroicons-exclamation-triangle"
          icon-class="text-red-500"
          @update:open="isDeleteModalOpen = $event"
        >
          <div class="space-y-4">
            <p class="text-sm text-gray-700 dark:text-gray-200">
              Êtes-vous absolument certain de vouloir supprimer votre compte ?
            </p>

            <p class="text-xs text-red-600 dark:text-red-400 font-medium">
              Attention : Cette action est irréversible. L'ensemble de vos données (comptes bancaires, transactions, règles de virement, planification mensuelle) sera immédiatement et définitivement effacé.
            </p>

            <div class="space-y-2 pt-2">
              <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Pour confirmer, veuillez saisir <span class="font-mono font-bold text-red-600 dark:text-red-400">SUPPRIMER</span> ci-dessous :
              </label>
              <UInput
                v-model="deleteConfirmationInput"
                placeholder="Tapez SUPPRIMER pour confirmer"
                class="w-full"
                autocomplete="off"
              />
            </div>
          </div>

          <template #footer>
            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-0 sm:space-x-3">
              <UButton
                label="Annuler"
                color="neutral"
                variant="ghost"
                class="w-full justify-center sm:w-auto cursor-pointer"
                @click="closeDeleteModal"
              />
              <UButton
                label="Supprimer définitivement mon compte"
                color="error"
                variant="solid"
                :loading="isDeleting"
                :disabled="deleteConfirmationInput !== 'SUPPRIMER'"
                class="w-full justify-center sm:w-auto cursor-pointer"
                @click="handleDeleteAccount"
              />
            </div>
          </template>
        </AppModal>
      </div>
    </template>
  </UDashboardPanel>
</template>
