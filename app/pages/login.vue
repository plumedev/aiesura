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
    password: password.value,
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
  <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h2 class="text-xl font-semibold text-center">Connexion</h2>
      </template>

      <form @submit.prevent="login" class="space-y-6">
        <UFormField label="Adresse email" name="email">
          <UInput v-model="email" type="email" placeholder="john@example.com" class="w-full" required />
        </UFormField>

        <UFormField label="Mot de passe" name="password">
          <UInput v-model="password" type="password" placeholder="••••••••" class="w-full" required />
        </UFormField>

        <UAlert v-if="errorMsg" color="red" variant="soft" :title="errorMsg" />

        <UButton type="submit" block class="w-full justify-center" :loading="loading" size="lg">
          Se connecter
        </UButton>
      </form>

      <template #footer>
        <div class="text-sm text-center space-y-2">
          <div>
            <ULink to="/forgot-password" class="text-primary-500 hover:underline">Mot de passe oublié ?</ULink>
          </div>
          <div>
            Pas encore de compte ? <ULink to="/register" class="text-primary-500 hover:underline">S'inscrire</ULink>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
