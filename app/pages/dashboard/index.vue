<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const logout = async () => {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <UButton color="gray" variant="ghost" icon="i-lucide-log-out" @click="logout">
        Déconnexion
      </UButton>
    </div>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Bienvenue !</h2>
      </template>
      <div class="space-y-4">
        <p>Vous êtes connecté avec l'adresse :</p>
        <UBadge size="lg" color="primary">{{ user?.email }}</UBadge>
        
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Ceci est une route protégée par le middleware de `@nuxtjs/supabase`.
          Si vous vous déconnectez et essayez de revenir sur `/dashboard`, vous serez redirigé vers `/login`.
        </p>
      </div>
    </UCard>
  </div>
</template>
