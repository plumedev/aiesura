<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const displayUser = computed(() => ({
  name: user.value?.user_metadata?.name || user.value?.email || 'Utilisateur',
  avatar: {
    src: 'https://github.com/nuxt.png', // Fallback avatar
    alt: 'Avatar'
  }
}))

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: 'label',
  label: displayUser.value.name,
  avatar: displayUser.value.avatar
}], [{
  label: 'Profil',
  icon: 'i-lucide-user'
}, {
  label: 'Paramètres',
  icon: 'i-lucide-settings',
  to: '/dashboard/settings'
}, {
  label: colorMode.value === 'dark' ? 'Mode clair' : 'Mode sombre',
  icon: colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon',
  onSelect: (e) => {
    e.preventDefault()
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
}], [{
  label: 'Se déconnecter',
  icon: 'i-lucide-log-out',
  onSelect: async () => {
    await supabase.auth.signOut()
    navigateTo('/login')
  }
}]]))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)',
      item: 'text-gray-700 dark:text-white hover:!text-gray-900 dark:hover:!text-white/80 hover:!bg-black/5 dark:hover:!bg-white/10 focus:!text-gray-900 dark:focus:!text-white/80 focus:!bg-black/5 dark:focus:!bg-white/10 transition-all rounded-md cursor-pointer',
      itemLeadingIcon: 'text-gray-500 dark:text-white group-hover:text-gray-700 dark:group-hover:text-white/80'
    }"
  >
    <UButton
      v-bind="{
        ...displayUser,
        label: collapsed ? undefined : displayUser.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:!bg-black/5 dark:data-[state=open]:!bg-white/10 text-gray-700 dark:text-white hover:!bg-black/5 dark:hover:!bg-white/10 hover:!text-gray-900 dark:hover:!text-white/80 transition-all rounded-md"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />
  </UDropdownMenu>
</template>
