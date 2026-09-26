<script setup lang="ts">
const supabase = useSupabaseClient()
const password = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)

const updatePassword = async () => {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  const { error } = await supabase.auth.updateUser({
    password: password.value
  })

  if (error) {
    errorMsg.value = error.message
  } else {
    successMsg.value = 'Votre mot de passe a été mis à jour avec succès.'
    setTimeout(() => {
      navigateTo('/dashboard')
    }, 2000)
  }
  loading.value = false
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex flex-col items-center gap-1.5 text-center">
          <AppLogo class="w-auto h-7 text-[#0A332C] dark:text-emerald-400 mb-1" />
          <h2 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Nouveau mot de passe
          </h2>
        </div>
      </template>

      <form
        class="space-y-5"
        @submit.prevent="updatePassword"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
          Veuillez saisir votre nouveau mot de passe ci-dessous.
        </p>

        <UFormField
          label="Nouveau mot de passe"
          name="password"
        >
          <UInput
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full"
            required
          />
        </UFormField>

        <UAlert
          v-if="errorMsg"
          color="error"
          variant="soft"
          :title="errorMsg"
        />
        <UAlert
          v-if="successMsg"
          color="success"
          variant="soft"
          :title="successMsg"
        />

        <UButton
          v-if="!successMsg"
          type="submit"
          block
          class="w-full justify-center"
          :loading="loading"
          size="lg"
        >
          Mettre à jour
        </UButton>
      </form>
    </UCard>
  </div>
</template>
