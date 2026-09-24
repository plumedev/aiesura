<script setup lang="ts">
const user = useSupabaseUser()

const navLinks = [
  { label: 'Démo interactive', to: '#demo' },
  { label: 'Fonctionnalités', to: '#features' },
  { label: 'Flux automatiques', to: '#flows' },
  { label: 'Checklist mensuelle', to: '#checklist' }
]
</script>

<template>
  <div class="flex flex-col min-h-screen selection:bg-[#0A332C] selection:text-white">
    <!-- Header de navigation public -->
    <UHeader
      mode="slideover"
      class="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-[#0A332C]/80 border-b border-black/5 dark:border-white/10"
    >
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center gap-2.5"
        >
          <AppLogo class="w-auto h-6 shrink-0 text-[#0A332C] dark:text-emerald-400" />
          <span class="font-bold text-lg tracking-tight text-gray-900 dark:text-white inline-block">
            Aiesura
          </span>
        </NuxtLink>
      </template>

      <!-- Navigation centrale pour desktop -->
      <nav class="hidden md:flex items-center gap-6">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-xs font-semibold text-gray-600 hover:text-[#0A332C] dark:text-gray-300 dark:hover:text-emerald-300 transition-colors"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <template #right>
        <div class="flex items-center gap-2">
          <UColorModeButton />

          <template v-if="user">
            <UButton
              to="/dashboard"
              icon="i-lucide-layout-dashboard"
              label="Dashboard"
              color="primary"
              variant="solid"
              size="sm"
              class="font-medium cursor-pointer"
            />
          </template>
          <template v-else>
            <UButton
              to="/login"
              label="Connexion"
              color="neutral"
              variant="ghost"
              size="sm"
              class="font-medium hidden sm:inline-flex cursor-pointer"
            />
            <UButton
              to="/register"
              label="Démarrer"
              trailing-icon="i-lucide-arrow-right"
              color="primary"
              variant="solid"
              size="sm"
              class="font-semibold cursor-pointer"
            />
          </template>
        </div>
      </template>

      <!-- Menu mobile (tiroir latéral slideover) -->
      <template #body>
        <div class="flex flex-col gap-6 py-4">
          <nav class="flex flex-col gap-2">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-black/5 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>

          <div class="border-t border-black/10 dark:border-white/10 pt-4 flex flex-col gap-3">
            <template v-if="user">
              <UButton
                to="/dashboard"
                icon="i-lucide-layout-dashboard"
                label="Accéder au Dashboard"
                color="primary"
                variant="solid"
                size="md"
                block
                class="font-medium justify-center"
              />
            </template>
            <template v-else>
              <UButton
                to="/login"
                label="Se connecter"
                color="neutral"
                variant="outline"
                size="md"
                block
                class="font-medium justify-center"
              />
              <UButton
                to="/register"
                label="Créer un compte"
                trailing-icon="i-lucide-arrow-right"
                color="primary"
                variant="solid"
                size="md"
                block
                class="font-semibold justify-center"
              />
            </template>
          </div>
        </div>
      </template>
    </UHeader>

    <!-- Contenu principal -->
    <UMain class="flex-grow">
      <slot />
    </UMain>

    <!-- Footer public épuré -->
    <footer class="border-t border-black/5 dark:border-white/10 bg-white/50 dark:bg-[#0A332C]/50 py-10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="flex flex-col items-center sm:items-start gap-1">
          <div class="flex items-center gap-2">
            <AppLogo class="w-auto h-5 shrink-0 text-[#0A332C] dark:text-emerald-400" />
            <span class="font-bold text-sm text-gray-900 dark:text-white">Aiesura</span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Gestion financière personnelle proactive, répartition automatisée des flux et clarté budgétaire.
          </p>
        </div>

        <div class="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
          <NuxtLink
            to="/login"
            class="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Connexion
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Créer un compte
          </NuxtLink>
          <span>•</span>
          <span>© {{ new Date().getFullYear() }} Aiesura. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  </div>
</template>
