<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)

const register = async () => {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        name: email.value.split('@')[0]
      }
    }
  })
  if (error) {
    errorMsg.value = error.message
  } else {
    successMsg.value = 'Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre compte.'
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
            Créer un compte
          </h2>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Commencez à piloter vos finances avec Aiesura
          </p>
        </div>
      </template>

      <form
        class="space-y-5"
        @submit.prevent="register"
      >
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

        <UFormField
          label="Mot de passe"
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
          S'inscrire
        </UButton>
      </form>

      <template #footer>
        <div class="text-sm text-center text-gray-600 dark:text-gray-300">
          <span>Déjà un compte ? </span>
          <ULink
            to="/login"
            class="text-emerald-700 hover:text-emerald-800 dark:text-[#50E8A8] dark:hover:text-[#A1EACA] font-medium transition-colors hover:underline"
          >
            Se connecter
          </ULink>
        </div>
      </template>
    </UCard>
  </div>
</template>
