<script setup lang="ts">
import type { ChecklistStep, GroupedSteps, GroupedTransitStep, GroupedDispatchStep, GroupedDirectStep } from '~/types'

type GroupedStep = GroupedTransitStep | GroupedDispatchStep | GroupedDirectStep

const props = defineProps<{
  steps: ChecklistStep[]
}>()

const emit = defineEmits<{
  saveStep: [step: GroupedStep, completed: boolean]
}>()

const { groupSteps } = useFlowPlanner()

const computedGroupedSteps = computed<GroupedSteps>(() => {
  return groupSteps(props.steps)
})

const handleToggle = (step: GroupedStep, val: boolean) => {
  emit('saveStep', step, val)
}
</script>

<template>
  <div class="rounded-xl bg-[#F1F5F3] dark:bg-[#0C3C32] p-6 space-y-6">
    <div class="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-4">
      <UIcon
        name="i-heroicons-clipboard-document-check"
        class="w-5 h-5 text-green-600 dark:text-green-400"
      />
      <h3 class="text-md font-semibold text-gray-900 dark:text-white uppercase tracking-wider font-mono">
        Plan d'action & Checklist
      </h3>
    </div>

    <div
      v-if="steps.length === 0"
      class="text-sm text-gray-500 dark:text-gray-400 py-4 font-mono text-center"
    >
      Aucune étape générée. Configurez des revenus et générez le plan.
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <!-- Étape 1 : Ravitaillement des comptes de transit -->
      <div
        v-if="computedGroupedSteps.transits.length > 0"
        class="space-y-3"
      >
        <div class="text-[11px] font-bold text-gray-500 dark:text-gray-400 font-mono uppercase tracking-widest border-l-2 border-green-500 dark:border-green-400 pl-2">
          Étape 1 : Ravitaillement des comptes de transit
        </div>
        <div class="space-y-2">
          <div
            v-for="step in computedGroupedSteps.transits"
            :key="step.id"
            class="p-4 border rounded-lg bg-white dark:bg-black/20 shadow-sm transition duration-300"
            :class="step.completed ? 'border-dashed border-gray-300 dark:border-gray-800 opacity-60' : 'border-black/10 dark:border-white/10'"
          >
            <div class="flex items-start gap-3">
              <UCheckbox
                :model-value="step.completed"
                @update:model-value="(val) => handleToggle(step, !!val)"
              />
              <div class="flex-1">
                <div
                  class="font-bold text-sm text-gray-900 dark:text-white"
                  :class="{ 'line-through text-gray-400 dark:text-gray-500': step.completed }"
                >
                  Faire un virement global de {{ formatAmount(step.amount) }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                  Depuis <strong class="text-gray-900 dark:text-white uppercase">{{ step.sourceName }}</strong> vers <strong class="text-gray-900 dark:text-white uppercase">{{ step.transitName }}</strong>
                </div>
                <div class="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-2 bg-black/5 dark:bg-white/5 p-2 rounded">
                  Regroupe les dispatchs : {{ step.aggregatedRuleNames.join(', ') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Étape 2 : Répartition depuis les comptes de transit -->
      <div
        v-if="computedGroupedSteps.dispatches.length > 0"
        class="space-y-3"
      >
        <div class="text-[11px] font-bold text-gray-500 dark:text-gray-400 font-mono uppercase tracking-widest border-l-2 border-green-500 dark:border-green-400 pl-2">
          Étape 2 : Répartition depuis les comptes de transit
        </div>
        <div class="space-y-2">
          <div
            v-for="step in computedGroupedSteps.dispatches"
            :key="step.id"
            class="p-4 border rounded-lg bg-white dark:bg-black/20 shadow-sm transition duration-300"
            :class="step.completed ? 'border-dashed border-gray-300 dark:border-gray-800 opacity-60' : 'border-black/10 dark:border-white/10'"
          >
            <div class="flex items-start gap-3">
              <UCheckbox
                :model-value="step.completed"
                @update:model-value="(val) => handleToggle(step, !!val)"
              />
              <div class="flex-1">
                <div
                  class="font-bold text-sm text-gray-900 dark:text-white"
                  :class="{ 'line-through text-gray-400 dark:text-gray-500': step.completed }"
                >
                  Transférer un total de {{ formatAmount(step.amount) }} vers {{ step.destName }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                  Depuis <strong class="text-gray-900 dark:text-white uppercase">{{ step.transitName }}</strong> vers <strong class="text-gray-900 dark:text-white uppercase">{{ step.destName }}</strong>
                </div>
                <div class="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-2 bg-black/5 dark:bg-white/5 p-2 rounded">
                  Détails : {{ step.subSteps.map(s => `${s.name} (${formatAmount(s.amount)})`).join(', ') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Étape 3 : Virements directs & prélèvements fixes -->
      <div
        v-if="computedGroupedSteps.directs.length > 0"
        class="space-y-3"
      >
        <div class="text-[11px] font-bold text-gray-500 dark:text-gray-400 font-mono uppercase tracking-widest border-l-2 border-green-500 dark:border-green-400 pl-2">
          Étape 3 : Virements directs & prélèvements fixes
        </div>
        <div class="space-y-2">
          <div
            v-for="step in computedGroupedSteps.directs"
            :key="step.id"
            class="p-4 border rounded-lg bg-white dark:bg-black/20 shadow-sm transition duration-300"
            :class="step.completed ? 'border-dashed border-gray-300 dark:border-gray-800 opacity-60' : 'border-black/10 dark:border-white/10'"
          >
            <div class="flex items-start gap-3">
              <UCheckbox
                :model-value="step.completed"
                @update:model-value="(val) => handleToggle(step, !!val)"
              />
              <div class="flex-1">
                <div
                  class="font-bold text-sm text-gray-900 dark:text-white"
                  :class="{ 'line-through text-gray-400 dark:text-gray-500': step.completed }"
                >
                  Virer un total de {{ formatAmount(step.amount) }} vers {{ step.destName }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                  Depuis <strong class="text-gray-900 dark:text-white uppercase">{{ step.sourceName }}</strong> directement vers <strong class="text-gray-900 dark:text-white uppercase">{{ step.destName }}</strong>
                </div>
                <div
                  v-if="step.subSteps.length > 1"
                  class="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-2 bg-black/5 dark:bg-white/5 p-2 rounded"
                >
                  Détails : {{ step.subSteps.map(s => `${s.name} (${formatAmount(s.amount)})`).join(', ') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
