<script setup lang="ts">
const user = useSupabaseUser()
</script>

<template>
  <div class="relative overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 p-8 sm:p-12 text-center bg-[#F1F5F3] dark:bg-[#0C3C32] shadow-xl">
    <!-- Halo vert forêt doux -->
    <div class="absolute -bottom-24 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-emerald-500/15 dark:bg-emerald-400/10 blur-3xl pointer-events-none rounded-full" />

    <div class="relative max-w-2xl mx-auto space-y-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#0A332C]/10 dark:bg-white/10 text-[#0A332C] dark:text-emerald-300">
        <UIcon
          name="i-lucide-arrow-up-right"
          class="w-3.5 h-3.5"
        />
        <span>Gestion financière personnelle</span>
      </div>

      <h3 class="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
        Commencez à organiser vos flux du mois
      </h3>

      <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
        Renseignez vos charges fixes, calculez votre épargne et suivez vos virements pas à pas.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <UButton
          v-if="user"
          to="/dashboard"
          icon="i-lucide-layout-dashboard"
          label="Accéder à mon tableau de bord"
          size="xl"
          color="primary"
          variant="solid"
          class="w-full sm:w-auto font-semibold px-6 cursor-pointer"
        />
        <template v-else>
          <UButton
            to="/register"
            icon="i-lucide-arrow-right"
            trailing
            label="Créer un compte"
            size="xl"
            color="primary"
            variant="solid"
            class="w-full sm:w-auto font-semibold px-6 cursor-pointer"
          />
          <UButton
            to="/login"
            icon="i-lucide-log-in"
            label="Se connecter"
            size="xl"
            color="neutral"
            variant="ghost"
            class="w-full sm:w-auto font-semibold px-6 cursor-pointer"
          />
        </template>
      </div>

      <div class="pt-4 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
        <span class="flex items-center gap-1.5">
          <UIcon
            name="i-lucide-check"
            class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
          />
          Sans engagement
        </span>
        <span class="flex items-center gap-1.5">
          <UIcon
            name="i-lucide-check"
            class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
          />
          Isolation RLS des données
        </span>
        <span class="flex items-center gap-1.5">
          <UIcon
            name="i-lucide-check"
            class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
          />
          100% autonome
        </span>
      </div>
    </div>
  </div>
</template>
