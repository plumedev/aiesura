<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const errorMsg = ref('')
const isChecking = ref(true)

const goToLogin = () => {
  navigateTo('/login')
}

const handleRedirect = async () => {
  try {
    const profile = await $fetch<{ onboarded: boolean }>('/api/profile')
    if (profile && profile.onboarded === false) {
      await navigateTo('/dashboard/onboarding')
    } else {
      await navigateTo('/dashboard')
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du profil sur /confirm:', error)
    await navigateTo('/dashboard')
  }
}

watch(user, async (currentUser) => {
  if (currentUser) {
    await handleRedirect()
  }
}, { immediate: true })

onMounted(async () => {
  if (user.value) {
    await handleRedirect()
    return
  }

  // Filet de sécurité si la session met un court instant à s'initialiser
  setTimeout(async () => {
    if (user.value) {
      await handleRedirect()
      return
    }

    const { data } = await supabase.auth.getSession()
    if (data.session) {
      await handleRedirect()
    } else {
      isChecking.value = false
      errorMsg.value = 'Le lien de confirmation est invalide ou a expiré.'
    }
  }, 3500)
})
</script>

<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex flex-col items-center gap-1.5 text-center">
          <AppLogo class="w-auto h-7 text-[#0A332C] dark:text-emerald-400 mb-1" />
          <h2 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Confirmation du compte
          </h2>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Finalisation de votre inscription à Aiesura
          </p>
        </div>
      </template>

      <div class="py-6 flex flex-col items-center justify-center text-center space-y-4">
        <template v-if="isChecking">
          <UIcon
            name="i-lucide-loader-2"
            class="w-8 h-8 text-[#0A332C] dark:text-emerald-400 animate-spin"
          />
          <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
            Validation de votre lien en cours...
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Vous allez être automatiquement redirigé.
          </p>
        </template>

        <template v-else>
          <UAlert
            v-if="errorMsg"
            color="error"
            variant="soft"
            :title="errorMsg"
            class="w-full"
          />
          <UButton
            color="primary"
            class="w-full justify-center mt-4"
            @click="goToLogin"
          >
            Aller à la connexion
          </UButton>
        </template>
      </div>
    </UCard>
  </div>
</template>
