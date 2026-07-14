<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <UDashboardPanel id="flows">
    <template #header>
      <UDashboardNavbar title="Flux Mensuels">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <p>Page Flux Mensuels (à implémenter)</p>
      </div>
    </template>
  </UDashboardPanel>
</template>
