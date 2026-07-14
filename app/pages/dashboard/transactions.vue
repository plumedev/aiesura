<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <UDashboardPanel id="transactions">
    <template #header>
      <UDashboardNavbar title="Transactions">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <p>Page Transactions (à implémenter)</p>
      </div>
    </template>
  </UDashboardPanel>
</template>
