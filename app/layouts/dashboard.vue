<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const toast = useToast()

const open = ref(false)

const links = [[{
  label: 'Vue d\'ensemble',
  icon: 'i-heroicons-home',
  to: '/dashboard',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Comptes',
  icon: 'i-heroicons-building-library',
  to: '/dashboard/accounts',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Transactions',
  icon: 'i-heroicons-banknotes',
  to: '/dashboard/transactions',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Flux Mensuels',
  icon: 'i-heroicons-chart-bar',
  to: '/dashboard/flows',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Règles de virement',
  icon: 'i-heroicons-arrows-right-left',
  to: '/dashboard/rules',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Paramètres',
  to: '/dashboard/settings',
  icon: 'i-heroicons-cog-8-tooth'
}], []] satisfies NavigationMenuItem[][]

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: 'We use first-party cookies to enhance your experience on our website.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Accept',
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }, {
      label: 'Opt out',
      color: 'neutral',
      variant: 'ghost'
    }]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header>
        <NuxtLink
          to="/"
          class="flex items-center gap-2 py-1"
        >
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
