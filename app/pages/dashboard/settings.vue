<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <UDashboardPanel id="settings">
    <template #header>
      <UDashboardNavbar title="Paramètres">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <p>Page Paramètres (à implémenter)</p>
      </div>
    </template>
  </UDashboardPanel>
</template>
