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
      <div class="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
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
      </div>
    </template>
  </UDashboardPanel>
</template>
