<script setup>
const user = useSupabaseUser()
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
      </template>

      <template #right>
        <UButton
          v-if="user"
          to="/dashboard"
          icon="i-lucide-layout-dashboard"
          label="Dashboard"
          color="primary"
          variant="soft"
        />
        <UButton
          v-else
          to="/login"
          icon="i-lucide-user"
          label="Se connecter"
          color="primary"
          variant="solid"
        />

        <UColorModeButton />
      </template>
    </UHeader>

    <UMain class="flex-grow">
      <slot />
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Built with Nuxt UI • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right />
    </UFooter>
  </div>
</template>
