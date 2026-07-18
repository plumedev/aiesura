<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const toast = useToast()

const open = ref(false)

const navItems = [
  { label: 'Vue d\'ensemble', icon: 'i-heroicons-home', to: '/dashboard' },
  { label: 'Comptes', icon: 'i-heroicons-building-library', to: '/dashboard/accounts' },
  { label: 'Transactions', icon: 'i-heroicons-banknotes', to: '/dashboard/transactions' },
  { label: 'Flux Mensuels', icon: 'i-heroicons-chart-bar', to: '/dashboard/flows' },
  { label: 'Règles de virement', icon: 'i-heroicons-arrows-right-left', to: '/dashboard/rules' },
  { label: 'Paramètres', icon: 'i-heroicons-cog-8-tooth', to: '/dashboard/settings' }
].map(item => ({ ...item, onSelect: () => { open.value = false } })) satisfies NavigationMenuItem[]

const links = [navItems, []] satisfies NavigationMenuItem[][]

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
          :ui="{
            link: 'before:!hidden text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 aria-[current=page]:!text-white aria-[current=page]:!bg-[#0C3C32] transition-all rounded-md',
            linkLeadingIcon: 'text-gray-500 dark:text-white group-hover:text-gray-700 dark:group-hover:text-white/80 group-aria-[current=page]:!text-white'
          }"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
          :ui="{
            link: 'before:!hidden text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 aria-[current=page]:!text-white aria-[current=page]:!bg-[#0C3C32] transition-all rounded-md',
            linkLeadingIcon: 'text-gray-500 dark:text-white group-hover:text-gray-700 dark:group-hover:text-white/80 group-aria-[current=page]:!text-white'
          }"
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
