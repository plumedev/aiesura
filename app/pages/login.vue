<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

const login = async () => {
  loading.value = true
  errorMsg.value = ''
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  if (error) {
    errorMsg.value = error.message
  } else {
    navigateTo('/dashboard')
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
            Connexion
          </h2>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Connectez-vous à votre espace Aiesura
          </p>
        </div>
      </template>

      <form
        class="space-y-5"
        @submit.prevent="login"
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

        <UButton
          type="submit"
          block
          class="w-full justify-center"
          :loading="loading"
          size="lg"
        >
          Se connecter
        </UButton>
      </form>

      <template #footer>
        <div class="text-sm text-center space-y-2 text-gray-600 dark:text-gray-300">
          <div>
            <ULink
              to="/forgot-password"
              class="text-emerald-700 hover:text-emerald-800 dark:text-[#50E8A8] dark:hover:text-[#A1EACA] font-medium transition-colors hover:underline"
            >
              Mot de passe oublié ?
            </ULink>
          </div>
          <div>
            <span>Pas encore de compte ? </span>
            <ULink
              to="/register"
              class="text-emerald-700 hover:text-emerald-800 dark:text-[#50E8A8] dark:hover:text-[#A1EACA] font-medium transition-colors hover:underline"
            >
              S'inscrire
            </ULink>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
