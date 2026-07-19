import type { TransferRule, ChecklistStep, GroupedSteps } from '~/types'

export function useFlowPlanner() {
  /**
   * Filtre les itérations liées à une règle pour ne garder que celles du mois sélectionné.
   */
  const getIterationAmountForMonth = (rule: TransferRule, month: string): number => {
    if (rule.amountType === 'fixed') {
      return Number(rule.amount || 0)
    }

    // Pour le type 'recurring', on fait la somme des montants des itérations liées du mois donné,
    // en appliquant le pourcentage défini pour chacune.
    let total = 0
    if (rule.linkedIterations && Array.isArray(rule.linkedIterations)) {
      rule.linkedIterations.forEach((li) => {
        const d = new Date(li.executionDate)
        const year = d.getFullYear()
        const monthNum = String(d.getMonth() + 1).padStart(2, '0')
        const executionMonth = `${year}-${monthNum}`
        if (executionMonth === month) {
          const amt = Number(li.amount || 0)
          total += amt * ((li.percentage || 100) / 100)
        }
      })
    }
    return total
  }

  /**
   * Algorithme pour générer les étapes de checklist à partir des règles et des revenus.
   */
  const generateSteps = (
    salary: number,
    rules: TransferRule[],
    month: string,
    previousSteps: ChecklistStep[] = [],
    preserveCompleted = true
  ): ChecklistStep[] => {
    const steps: ChecklistStep[] = []

    // Capturer les anciens états cochés si demandé
    const completedRuleIds = new Set<string>()
    const completedTransitRuleIds = new Set<string>()
    if (preserveCompleted && previousSteps && previousSteps.length > 0) {
      previousSteps.forEach((s) => {
        if (s.completed) {
          completedRuleIds.add(s.ruleId)
        }
        if (s.transitCompleted) {
          completedTransitRuleIds.add(s.ruleId)
        }
      })
    }

    // Solde restant par compte source
    const remainingSalaries = new Map<string, number>()

    // Trier les règles : fixed et recurring d'abord
    const sortedRules = [...rules].sort((a, b) => {
      // remaining ou autre si implémenté plus tard
      return a.order - b.order
    })

    sortedRules.forEach((rule) => {
      const sourceName = rule.sourceAccount?.name || 'Source inconnue'

      // Initialiser le solde du compte principal avec le salaire total calculé
      if (!remainingSalaries.has(sourceName)) {
        remainingSalaries.set(sourceName, salary)
      }

      const amount = getIterationAmountForMonth(rule, month)
      const currentBalance = remainingSalaries.get(sourceName) || 0
      remainingSalaries.set(sourceName, currentBalance - amount)

      steps.push({
        ruleId: rule.id,
        name: rule.purposeName,
        sourceName,
        sourceAccountId: rule.sourceAccount?.id,
        transitName: rule.transitAccount ? rule.transitAccount.name : null,
        transitAccountId: rule.transitAccount ? rule.transitAccount.id : null,
        destName: rule.destinationAccount?.name || 'Destination inconnue',
        destAccountId: rule.destinationAccount?.id,
        amount,
        completed: preserveCompleted ? completedRuleIds.has(rule.id) : false,
        transitCompleted: preserveCompleted ? completedTransitRuleIds.has(rule.id) : false,
        amountType: rule.amountType
      })
    })

    return steps
  }

  /**
   * Regroupement des étapes de la checklist en 3 étapes (ravitaillements, répartitions, directs)
   */
  const groupSteps = (steps: ChecklistStep[]): GroupedSteps => {
    if (!steps || steps.length === 0) {
      return { transits: [], dispatches: [], directs: [] }
    }

    // 1. Identifier quels comptes agissent en tant que comptes de transit
    const transitAccounts = new Set<string>()
    steps.forEach((step) => {
      if (step.transitName) {
        transitAccounts.add(step.transitName)
      }
    })

    const transitsMap = new Map<string, GroupedSteps['transits'][number]>()
    const dispatchesMap = new Map<string, GroupedSteps['dispatches'][number]>()
    const directsMap = new Map<string, GroupedSteps['directs'][number]>()

    steps.forEach((step) => {
      // Étape 1 : Ravitaillement du compte de transit
      // Si l'étape passe par un transit, OU si elle transfère directement vers un compte qui sert de transit
      if (step.transitName || transitAccounts.has(step.destName)) {
        const transitName = step.transitName || step.destName
        const transitKey = `${step.sourceName}_to_${transitName}`

        if (transitsMap.has(transitKey)) {
          const item = transitsMap.get(transitKey)!
          item.amount += step.amount
          if (!item.aggregatedRuleNames.includes(step.name)) {
            item.aggregatedRuleNames.push(step.name)
          }
          if (!step.transitCompleted) {
            item.completed = false
          }
        } else {
          transitsMap.set(transitKey, {
            id: `grouped-transit-${transitKey}`,
            sourceName: step.sourceName,
            transitName,
            amount: step.amount,
            completed: !!step.transitCompleted,
            aggregatedRuleNames: [step.name]
          })
        }

        // Étape 2 : Répartition depuis le compte de transit
        if (step.transitName) {
          const dispatchKey = `${step.transitName}_to_${step.destName}`
          if (dispatchesMap.has(dispatchKey)) {
            const item = dispatchesMap.get(dispatchKey)!
            item.amount += step.amount
            item.subSteps.push({ name: step.name, amount: step.amount })
            if (!step.completed) {
              item.completed = false
            }
          } else {
            dispatchesMap.set(dispatchKey, {
              id: `grouped-dispatch-${dispatchKey}`,
              transitName: step.transitName,
              destName: step.destName,
              amount: step.amount,
              completed: step.completed,
              subSteps: [{ name: step.name, amount: step.amount }]
            })
          }
        }
      } else {
        // Étape 3 : Virements directs
        const directKey = `${step.sourceName}_to_${step.destName}`
        if (directsMap.has(directKey)) {
          const item = directsMap.get(directKey)!
          item.amount += step.amount
          item.subSteps.push({ name: step.name, amount: step.amount })
          if (!step.completed) {
            item.completed = false
          }
        } else {
          directsMap.set(directKey, {
            id: `grouped-direct-${directKey}`,
            sourceName: step.sourceName,
            destName: step.destName,
            amount: step.amount,
            completed: step.completed,
            subSteps: [{ name: step.name, amount: step.amount }]
          })
        }
      }
    })

    return {
      transits: Array.from(transitsMap.values()),
      dispatches: Array.from(dispatchesMap.values()),
      directs: Array.from(directsMap.values())
    }
  }

  return {
    getIterationAmountForMonth,
    generateSteps,
    groupSteps
  }
}
