<script setup lang="ts">
import { mockRules } from '~/utils/landingMockData'
import { formatAmount } from '~/utils'
import type { TransferRule, ChecklistStep } from '~/types'

const salary = ref(3200)

const setSalary = (val: number) => {
  salary.value = val
}

const onSliderInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  salary.value = Number(target.value)
}

// Calcul dynamique des étapes de flux réelles à injecter dans FlowsFlowDiagram
const dynamicSteps = computed<ChecklistStep[]>(() => {
  const sal = salary.value
  const epargneSecurity = Math.round(sal * 0.20)
  const investPea = Math.round(sal * 0.10)
  const projets = 250
  const loyer = 950

  return [
    {
      ruleId: 'rule-1',
      name: 'Épargne de précaution (20%)',
      sourceName: 'Compte Facturation / Pro',
      sourceAccountId: 'acc-pro',
      transitName: 'Compte Courant Principal',
      transitAccountId: 'acc-main',
      destName: 'Livret A (Sécurité)',
      destAccountId: 'acc-livret',
      amount: epargneSecurity,
      completed: true,
      transitCompleted: true,
      amountType: 'recurring'
    },
    {
      ruleId: 'rule-2',
      name: 'Provision Vacances & Projets',
      sourceName: 'Compte Facturation / Pro',
      sourceAccountId: 'acc-pro',
      transitName: 'Compte Courant Principal',
      transitAccountId: 'acc-main',
      destName: 'Compte Projets & Vacances',
      destAccountId: 'acc-projets',
      amount: projets,
      completed: false,
      transitCompleted: true,
      amountType: 'fixed'
    },
    {
      ruleId: 'rule-3',
      name: 'Investissement PEA ETF World (10%)',
      sourceName: 'Compte Facturation / Pro',
      sourceAccountId: 'acc-pro',
      transitName: 'Compte Courant Principal',
      transitAccountId: 'acc-main',
      destName: 'PEA Bourse (ETF World)',
      destAccountId: 'acc-pea',
      amount: investPea,
      completed: false,
      transitCompleted: true,
      amountType: 'recurring'
    },
    {
      ruleId: 'rule-4',
      name: 'Loyer et charges fixes',
      sourceName: 'Compte Courant Principal',
      sourceAccountId: 'acc-main',
      transitName: null,
      transitAccountId: null,
      destName: 'Propriétaire Appartement',
      destAccountId: 'acc-rent',
      amount: loyer,
      completed: true,
      transitCompleted: false,
      amountType: 'fixed'
    }
  ]
})

const dynamicRules = computed<TransferRule[]>(() => {
  return mockRules
})
</script>

<template>
  <div class="rounded-2xl border border-black/10 dark:border-white/10 bg-[#F1F5F3] dark:bg-[#0C3C32] p-6 sm:p-8 shadow-xl space-y-6">
    <!-- En-tête de section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-black/5 dark:border-white/10">
      <div>
        <div class="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          <UIcon
            name="i-heroicons-chart-bar"
            class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
          />
          <span>Tableau de bord : Flux Mensuels</span>
        </div>
        <h4 class="text-xl font-bold text-gray-900 dark:text-white">
          Le Modèle Visuel de vos Flux Financiers
        </h4>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Voici le composant de diagramme exact de l'application. Ajustez le revenu ci-contre pour voir le calcul se propager à travers les comptes.
        </p>
      </div>

      <!-- Contrôleur de salaire interactif -->
      <div class="flex flex-col gap-2 min-w-[280px] p-3 rounded-xl bg-white dark:bg-[#0A332C] border border-black/5 dark:border-white/10">
        <div class="flex justify-between text-xs font-semibold">
          <span class="text-gray-500 dark:text-gray-400">Revenu mensuel simulé</span>
          <span class="text-gray-900 dark:text-white font-bold tabular-nums">{{ formatAmount(salary) }}</span>
        </div>

        <input
          type="range"
          min="2000"
          max="5000"
          step="100"
          :value="salary"
          class="w-full accent-[#0A332C] dark:accent-emerald-400 cursor-pointer h-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          @input="onSliderInput"
        >

        <div class="flex justify-between gap-2 pt-1">
          <button
            type="button"
            class="text-[11px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
            @click="setSalary(2400)"
          >
            2 400 €
          </button>
          <button
            type="button"
            class="text-[11px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
            @click="setSalary(3200)"
          >
            3 200 €
          </button>
          <button
            type="button"
            class="text-[11px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
            @click="setSalary(4500)"
          >
            4 500 €
          </button>
        </div>
      </div>
    </div>

    <!-- ── Cartes d'en-tête identiques à dashboard/flows.vue ── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Période & Action -->
      <div class="p-4 rounded-xl bg-white dark:bg-[#0A332C] border border-black/10 dark:border-white/10 space-y-3 shadow-sm">
        <div class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
          Période de planification
        </div>
        <div class="flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white">
          <span>Octobre 2026</span>
          <span class="text-xs text-emerald-600 dark:text-emerald-400 font-mono">En cours</span>
        </div>
        <div>
          <div class="flex justify-between text-xs mb-1 font-mono">
            <span class="text-gray-500 dark:text-gray-400">Progression</span>
            <span class="font-bold text-gray-900 dark:text-white">50%</span>
          </div>
          <div class="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div class="h-full bg-green-500 rounded-full w-1/2" />
          </div>
        </div>
      </div>

      <!-- Revenus sélectionnés -->
      <div class="lg:col-span-2 p-4 rounded-xl bg-white dark:bg-[#0A332C] border border-black/10 dark:border-white/10 flex flex-col justify-between gap-3 shadow-sm">
        <div class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono flex justify-between">
          <span>Revenus de planification</span>
          <span class="text-gray-900 dark:text-white font-bold">{{ formatAmount(salary) }}</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <UBadge
            variant="soft"
            color="neutral"
            class="text-xs font-mono"
          >
            Salaire Facturation ({{ formatAmount(salary) }})
          </UBadge>
        </div>
      </div>
    </div>

    <!-- ── COMPOSANT RÉEL : FlowsFlowDiagram ── -->
    <div class="shadow-sm">
      <FlowsFlowDiagram
        :rules="dynamicRules"
        :steps="dynamicSteps"
      />
    </div>
  </div>
</template>
