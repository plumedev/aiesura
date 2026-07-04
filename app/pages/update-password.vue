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
  <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h2 class="text-xl font-semibold text-center">Nouveau mot de passe</h2>
      </template>

      <form @submit.prevent="updatePassword" class="space-y-6">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Veuillez saisir votre nouveau mot de passe ci-dessous.
        </p>

        <UFormField label="Nouveau mot de passe" name="password">
          <UInput v-model="password" type="password" placeholder="••••••••" class="w-full" required />
        </UFormField>

        <UAlert v-if="errorMsg" color="red" variant="soft" :title="errorMsg" />
        <UAlert v-if="successMsg" color="green" variant="soft" :title="successMsg" />

        <UButton v-if="!successMsg" type="submit" block class="w-full justify-center" :loading="loading" size="lg">
          Mettre à jour
        </UButton>
      </form>
    </UCard>
  </div>
</template>
