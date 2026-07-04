<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)

const resetPassword = async () => {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  // Dans un vrai projet, il faudrait l'URL du site en production
  // Pour le dev, supabase utilisera son URL de redirection par défaut configurée dans le dashboard
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: 'http://localhost:3000/update-password',
  })
  
  if (error) {
    errorMsg.value = error.message
  } else {
    successMsg.value = 'Un lien de réinitialisation vous a été envoyé si l\'adresse existe.'
  }
  loading.value = false
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h2 class="text-xl font-semibold text-center">Mot de passe oublié</h2>
      </template>

      <form @submit.prevent="resetPassword" class="space-y-6">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        <UFormField label="Adresse email" name="email">
          <UInput v-model="email" type="email" placeholder="john@example.com" class="w-full" required />
        </UFormField>

        <UAlert v-if="errorMsg" color="red" variant="soft" :title="errorMsg" />
        <UAlert v-if="successMsg" color="green" variant="soft" :title="successMsg" />

        <UButton v-if="!successMsg" type="submit" block class="w-full justify-center" :loading="loading" size="lg">
          Envoyer le lien
        </UButton>
      </form>

      <template #footer>
        <div class="text-sm text-center">
          <ULink to="/login" class="text-primary-500 hover:underline">Retour à la connexion</ULink>
        </div>
      </template>
    </UCard>
  </div>
</template>
