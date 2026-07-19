<script setup lang="ts">
import type { TransferRule, ChecklistStep } from '~/types'

const props = defineProps<{
  rules: TransferRule[]
  steps: ChecklistStep[]
}>()

const activeNode = ref<string | null>(null)

const getDestIcon = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('bybit') || n.includes('crypto')) return 'i-heroicons-circle-stack'
  if (n.includes('course') || n.includes('groceries')) return 'i-heroicons-shopping-cart'
  if (n.includes('commun') || n.includes('joint')) return 'i-heroicons-users'
  if (n.includes('loyer') || n.includes('rent')) return 'i-heroicons-home'
  if (n.includes('épargne') || n.includes('voyage') || n.includes('save')) return 'i-heroicons-sparkles'
  return 'i-heroicons-arrow-right-circle'
}

const computedFlowData = computed(() => {
  const sourcesMap = new Map<string, { id: string, name: string, amount: number }>()
  const transitsMap = new Map<string, { id: string, name: string, amount: number }>()
  const destinations: { id: string, name: string, amount: number, transitName?: string, ruleName: string }[] = []

  // 1. Identifier les comptes qui agissent comme comptes de transit
  const transitAccounts = new Set<string>()
  props.steps.forEach((step) => {
    if (step.transitName) {
      transitAccounts.add(step.transitName)
    }
  })

  props.steps.forEach((step, index) => {
    const amount = Number(step.amount || 0)

    // Source
    const sourceName = step.sourceName || 'Source inconnue'
    if (sourcesMap.has(sourceName)) {
      sourcesMap.get(sourceName)!.amount += amount
    } else {
      sourcesMap.set(sourceName, { id: `src-${index}`, name: sourceName, amount })
    }

    // Transit & Destination
    if (step.transitName) {
      const transitName = step.transitName
      if (transitsMap.has(transitName)) {
        transitsMap.get(transitName)!.amount += amount
      } else {
        transitsMap.set(transitName, { id: `trans-${index}`, name: transitName, amount })
      }

      const destName = step.destName || 'Destination inconnue'
      destinations.push({
        id: `dest-${index}`,
        name: destName,
        amount,
        transitName,
        ruleName: step.name
      })
    } else if (transitAccounts.has(step.destName)) {
      const transitName = step.destName
      if (transitsMap.has(transitName)) {
        transitsMap.get(transitName)!.amount += amount
      } else {
        transitsMap.set(transitName, { id: `trans-${index}`, name: transitName, amount })
      }
    } else {
      const destName = step.destName || 'Destination inconnue'
      destinations.push({
        id: `dest-${index}`,
        name: destName,
        amount,
        transitName: undefined,
        ruleName: step.name
      })
    }
  })

  // 3. Calculer les montants dispatchés et restants pour les comptes de transit
  const transitDispatchedMap = new Map<string, number>()
  destinations.forEach((dest) => {
    if (dest.transitName) {
      transitDispatchedMap.set(dest.transitName, (transitDispatchedMap.get(dest.transitName) || 0) + dest.amount)
    }
  })

  const transitsList = Array.from(transitsMap.values()).map((transit) => {
    const dispatched = transitDispatchedMap.get(transit.name) || 0
    const remaining = Math.max(0, transit.amount - dispatched)
    return {
      ...transit,
      dispatched,
      remaining
    }
  })

  return {
    sources: Array.from(sourcesMap.values()),
    transits: transitsList,
    destinations: destinations.sort((a, b) => (b.transitName ? 1 : 0) - (a.transitName ? 1 : 0))
  }
})
</script>

<template>
  <div class="border border-default bg-[#F1F5F3] dark:bg-[#0C3C32] rounded-xl p-6 relative overflow-hidden">
    <div class="flex items-center gap-2 mb-6 border-b border-black/10 dark:border-white/10 pb-4">
      <UIcon
        name="i-heroicons-share"
        class="w-5 h-5 text-green-600 dark:text-green-400"
      />
      <h3 class="text-md font-semibold text-gray-900 dark:text-white uppercase tracking-wider font-mono">
        Modèle de flux visuel
      </h3>
    </div>

    <div
      v-if="rules.length === 0"
      class="text-center py-12 text-gray-500 dark:text-gray-400 font-mono text-xs"
    >
      Aucune règle de transfert configurée pour générer le schéma.
    </div>

    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-3 gap-6 relative min-h-[300px]"
    >
      <!-- Column 1: Sources -->
      <div class="flex flex-col gap-4 justify-center">
        <div class="text-[10px] font-bold text-gray-500 dark:text-gray-400 font-mono uppercase tracking-widest border-b border-dashed border-black/15 dark:border-white/15 pb-1 mb-2">
          Sources de fonds
        </div>
        <div
          v-for="source in computedFlowData.sources"
          :key="source.id"
          class="flow-card p-4 rounded-lg border bg-white dark:bg-black/20 shadow-sm relative group transition-all duration-300 hover:border-green-500 dark:hover:border-green-400"
          :class="activeNode === source.name ? 'border-green-500 dark:border-green-400 ring-2 ring-green-500/10' : 'border-black/10 dark:border-white/10'"
          @mouseenter="activeNode = source.name"
          @mouseleave="activeNode = null"
        >
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-wallet"
              class="text-gray-400 w-4 h-4"
            />
            <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white uppercase">{{ source.name }}</span>
          </div>
          <div class="mt-2 text-xl font-bold text-gray-900 dark:text-white font-mono">
            {{ formatAmount(source.amount) }}
          </div>
          <div class="text-[10px] text-gray-500 dark:text-gray-400 font-mono mt-1">
            Total distribué
          </div>
        </div>
      </div>

      <!-- Column 2: Transits -->
      <div class="flex flex-col gap-4 justify-center relative">
        <div class="text-[10px] font-bold text-gray-500 dark:text-gray-400 font-mono uppercase tracking-widest border-b border-dashed border-black/15 dark:border-white/15 pb-1 mb-2">
          Comptes de Transit
        </div>

        <div
          v-if="computedFlowData.transits.length === 0"
          class="flex items-center justify-center h-full border border-dashed border-black/15 dark:border-white/15 rounded-lg p-6 text-center text-gray-500 dark:text-gray-400 font-mono text-[10px]"
        >
          (Virements directs uniquement)
        </div>

        <div
          v-for="transit in computedFlowData.transits"
          v-else
          :key="transit.id"
          class="flow-card p-4 rounded-lg border bg-white dark:bg-black/20 shadow-sm relative group transition-all duration-300 hover:border-green-500 dark:hover:border-green-400"
          :class="activeNode === transit.name ? 'border-green-500 dark:border-green-400 ring-2 ring-green-500/10' : 'border-black/10 dark:border-white/10'"
          @mouseenter="activeNode = transit.name"
          @mouseleave="activeNode = null"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-arrow-path"
                class="text-gray-400 w-4 h-4 animate-spin-slow"
              />
              <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white uppercase">{{ transit.name }}</span>
            </div>
            <UBadge
              size="sm"
              variant="soft"
              color="neutral"
              class="font-mono"
            >
              Transit
            </UBadge>
          </div>
          <div class="mt-2 text-xl font-bold text-gray-900 dark:text-white font-mono">
            {{ formatAmount(transit.amount) }}
          </div>
          <div class="flex flex-col gap-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-mono mt-2 pt-2 border-t border-black/10 dark:border-white/10">
            <div class="flex justify-between">
              <span>Total reçu :</span>
              <span class="text-gray-900 dark:text-white font-medium">{{ formatAmount(transit.amount) }}</span>
            </div>
            <div
              v-if="transit.dispatched > 0"
              class="flex justify-between"
            >
              <span>Dispatché :</span>
              <span class="text-gray-800 dark:text-gray-200">{{ formatAmount(transit.dispatched) }}</span>
            </div>
            <div
              v-if="transit.remaining > 0"
              class="flex justify-between font-bold text-green-600 dark:text-green-400"
            >
              <span>Reste sur le compte :</span>
              <span>{{ formatAmount(transit.remaining) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Column 3: Destinations -->
      <div class="flex flex-col gap-4 justify-center">
        <div class="text-[10px] font-bold text-gray-500 dark:text-gray-400 font-mono uppercase tracking-widest border-b border-dashed border-black/15 dark:border-white/15 pb-1 mb-2">
          Enveloppes & Epargnes
        </div>
        <div
          v-for="dest in computedFlowData.destinations"
          :key="dest.id"
          class="flow-card p-4 rounded-lg border bg-white dark:bg-black/20 shadow-sm relative group transition-all duration-300 hover:border-green-500 dark:hover:border-green-400"
          :class="(activeNode === dest.name || activeNode === dest.transitName) ? 'border-green-500 dark:border-green-400 ring-2 ring-green-500/10' : 'border-black/10 dark:border-white/10'"
          @mouseenter="activeNode = dest.name"
          @mouseleave="activeNode = null"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <UIcon
                :name="getDestIcon(dest.name)"
                class="text-gray-400 w-4 h-4"
              />
              <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white uppercase">{{ dest.name }}</span>
            </div>
            <UBadge
              v-if="dest.transitName"
              size="sm"
              variant="soft"
              color="success"
              class="font-mono text-[9px]"
            >
              via {{ dest.transitName }}
            </UBadge>
            <UBadge
              v-else
              size="sm"
              variant="soft"
              color="neutral"
              class="font-mono text-[9px]"
            >
              Direct
            </UBadge>
          </div>
          <div class="mt-2 text-xl font-bold text-gray-900 dark:text-white font-mono">
            {{ formatAmount(dest.amount) }}
          </div>
          <div class="text-[10px] text-gray-500 dark:text-gray-400 font-mono mt-1 truncate">
            {{ dest.ruleName }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 12s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.flow-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
