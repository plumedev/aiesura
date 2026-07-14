<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <UDashboardPanel id="rules">
    <template #header>
      <UDashboardNavbar title="Règles de virement">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <p>Page Règles de virement (à implémenter)</p>
      </div>
    </template>
  </UDashboardPanel>
</template>
