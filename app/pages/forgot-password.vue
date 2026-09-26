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
    redirectTo: 'http://localhost:3000/update-password'
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
  <div class="flex items-center justify-center min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex flex-col items-center gap-1.5 text-center">
          <AppLogo class="w-auto h-7 text-[#0A332C] dark:text-emerald-400 mb-1" />
          <h2 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Mot de passe oublié
          </h2>
        </div>
      </template>

      <form
        class="space-y-5"
        @submit.prevent="resetPassword"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        <UFormField
          label="Adresse email"
          name="email"
        >
          <UInput
            v-model="email"
            type="email"
            placeholder="john@example.com"
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
          Envoyer le lien
        </UButton>
      </form>

      <template #footer>
        <div class="text-sm text-center text-gray-600 dark:text-gray-300">
          <ULink
            to="/login"
            class="text-emerald-700 hover:text-emerald-800 dark:text-[#50E8A8] dark:hover:text-[#A1EACA] font-medium transition-colors hover:underline"
          >
            Retour à la connexion
          </ULink>
        </div>
      </template>
    </UCard>
  </div>
</template>
