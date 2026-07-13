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
    password: password.value
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
  <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h2 class="text-xl font-semibold text-center">
          Créer un compte
        </h2>
      </template>

      <form
        class="space-y-6"
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
        <div class="text-sm text-center">
          Déjà un compte ? <ULink
            to="/login"
            class="text-primary-500 hover:underline"
          >Se connecter</ULink>
        </div>
      </template>
    </UCard>
  </div>
</template>
