<script setup lang="ts">
import { mockSteps } from '~/utils/landingMockData'
import type { GroupedStep, ChecklistStep, GroupedTransitStep, GroupedDispatchStep, GroupedDirectStep } from '~/types'

const steps = ref<ChecklistStep[]>(JSON.parse(JSON.stringify(mockSteps)))

const handleSaveStep = (step: GroupedStep, completed: boolean) => {
  if (step.id && step.id.startsWith('grouped-transit-')) {
    const transitStep = step as GroupedTransitStep
    steps.value.forEach((s) => {
      if (s.sourceName === transitStep.sourceName && (s.transitName === transitStep.transitName || (!s.transitName && s.destName === transitStep.transitName))) {
        s.transitCompleted = completed
      }
    })
  } else if (step.id && step.id.startsWith('grouped-dispatch-')) {
    const dispatchStep = step as GroupedDispatchStep
    steps.value.forEach((s) => {
      if (s.transitName === dispatchStep.transitName && s.destName === dispatchStep.destName) {
        s.completed = completed
      }
    })
  } else if (step.id && step.id.startsWith('grouped-direct-')) {
    const directStep = step as GroupedDirectStep
    steps.value.forEach((s) => {
      if (s.sourceName === directStep.sourceName && s.destName === directStep.destName) {
        s.completed = completed
      }
    })
  }
}

const { groupSteps } = useFlowPlanner()

const progressPercentage = computed(() => {
  const grouped = groupSteps(steps.value)
  let total = 0
  let done = 0

  if (grouped.transits.length > 0) {
    grouped.transits.forEach((s) => {
      total++
      if (s.completed) done++
    })
  }
  if (grouped.dispatches.length > 0) {
    grouped.dispatches.forEach((s) => {
      total++
      if (s.completed) done++
    })
  }
  if (grouped.directs.length > 0) {
    grouped.directs.forEach((s) => {
      total++
      if (s.completed) done++
    })
  }

  if (total === 0) return 0
  return Math.round((done / total) * 100)
})

const resetAll = () => {
  steps.value.forEach((s) => {
    s.completed = false
    s.transitCompleted = false
  })
}

const completeAll = () => {
  steps.value.forEach((s) => {
    s.completed = true
    s.transitCompleted = true
  })
}
</script>

<template>
  <div class="rounded-2xl border border-black/10 dark:border-white/10 bg-[#F1F5F3] dark:bg-[#0C3C32] p-4 sm:p-8 shadow-xl space-y-6">
    <!-- En-tête explicatif fidèle -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
      <div>
        <div class="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          <UIcon
            name="i-heroicons-clipboard-document-check"
            class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
          />
          <span>Tableau de bord : Checklist mensuelle</span>
        </div>
        <h4 class="text-xl font-bold text-gray-900 dark:text-white">
          La Checklist d'exécution du 1er du mois
        </h4>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Voici le composant de checklist exact de l'application. Cochez les étapes pour voir la progression s'ajuster en direct.
        </p>
      </div>

      <!-- Contrôles rapides -->
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          type="button"
          class="text-xs px-3 py-1.5 rounded-lg bg-white/80 dark:bg-black/20 hover:bg-black/5 text-gray-700 dark:text-gray-200 border border-black/5 dark:border-white/5 font-mono cursor-pointer"
          @click="completeAll"
        >
          Tout cocher
        </button>
        <button
          type="button"
          class="text-xs px-3 py-1.5 rounded-lg bg-white/80 dark:bg-black/20 hover:bg-black/5 text-gray-700 dark:text-gray-200 border border-black/5 dark:border-white/5 font-mono cursor-pointer"
          @click="resetAll"
        >
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Barre de progression authentique (comme dashboard/flows.vue) -->
    <div class="p-4 rounded-xl bg-white dark:bg-[#0A332C] border border-black/10 dark:border-white/10 space-y-2 shadow-sm">
      <div class="flex items-center justify-between text-xs font-mono">
        <span class="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
          Progression de l'exécution mensuelle
        </span>
        <span class="text-gray-900 dark:text-white font-bold text-sm">
          {{ progressPercentage }}%
        </span>
      </div>
      <div class="w-full h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500 bg-green-500 dark:bg-green-400"
          :style="{ width: `${progressPercentage}%` }"
        />
      </div>
    </div>

    <!-- ── COMPOSANT RÉEL : FlowsTodoList ── -->
    <div class="shadow-sm">
      <FlowsTodoList
        :steps="steps"
        @save-step="handleSaveStep"
      />
    </div>
  </div>
</template>
