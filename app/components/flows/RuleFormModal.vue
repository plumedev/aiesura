<script setup lang="ts">
import type { TransactionIteration, TransferRule, ChecklistStep } from '~/types'

interface Account {
  id: string
  name: string
  isMain?: boolean
}

type EditableRule = TransferRule | (ChecklistStep & { id?: string })

const props = defineProps<{
  open: boolean
  rule?: EditableRule | null
  iterations: TransactionIteration[]
  accounts: Account[]
  monthLabel?: string
  hasCurrentPlan?: boolean
}>()

const emit = defineEmits<{
  close: []
  created: []
  saveMonthly: [step: ChecklistStep]
}>()

const handleClose = () => emit('close')

const toast = useToast()
const loading = ref(false)
const isEdit = computed(() => !!props.rule)

const scope = ref<'month' | 'global'>('global')

const scopeOptions = computed(() => [
  {
    label: props.monthLabel ? `Ce mois uniquement (${props.monthLabel})` : 'Ce mois uniquement',
    value: 'month'
  },
  {
    label: 'Modèle global (tous les mois)',
    value: 'global'
  }
])

const defaultSourceAccount = computed(() =>
  props.accounts.find(a => a.isMain)?.id || props.accounts[0]?.id || ''
)

const form = reactive({
  purposeName: '',
  sourceAccountId: defaultSourceAccount.value,
  transitAccountId: 'none' as string | 'none',
  destinationAccountId: '',
  amountType: 'fixed' as 'fixed' | 'recurring',
  amount: undefined as number | undefined,
  iterations: [] as Array<{ id: string, percentage: number }>
})

const amountTypeOptions = [
  { label: 'Montant fixe', value: 'fixed' },
  { label: 'Montant récurrent', value: 'recurring' }
]

const accountOptions = computed(() =>
  props.accounts.map(a => ({ label: a.name, value: a.id }))
)

const transitAccountOptions = computed(() => [
  { label: 'Aucun (virement direct)', value: 'none' },
  ...accountOptions.value
])

const isTxSelected = (id: string) => {
  return form.iterations.some(item => item.id === id)
}

const toggleTxSelection = (id: string, checked: boolean) => {
  if (checked) {
    if (!form.iterations.some(item => item.id === id)) {
      form.iterations.push({ id, percentage: 100 })
    }
  } else {
    form.iterations = form.iterations.filter(item => item.id !== id)
  }
}

const getTxPercentage = (id: string) => {
  const found = form.iterations.find(item => item.id === id)
  return found ? found.percentage : 100
}

const updateTxPercentage = (id: string, percentage: number) => {
  const found = form.iterations.find(item => item.id === id)
  if (found) {
    found.percentage = Math.max(1, Math.min(100, percentage || 100))
  }
}

const resetForm = () => {
  form.purposeName = ''
  form.sourceAccountId = defaultSourceAccount.value
  form.transitAccountId = 'none'
  form.destinationAccountId = ''
  form.amountType = 'fixed'
  form.amount = undefined
  form.iterations = []
  scope.value = props.hasCurrentPlan ? 'month' : 'global'
}

// Remplir le formulaire selon le type d'objet édité (TransferRule ou ChecklistStep)
watch(() => props.rule, (newRule) => {
  if (newRule) {
    if ('sourceAccount' in newRule) {
      // Cas TransferRule standard
      form.purposeName = newRule.purposeName
      form.sourceAccountId = newRule.sourceAccount.id
      form.transitAccountId = newRule.transitAccount ? newRule.transitAccount.id : 'none'
      form.destinationAccountId = newRule.destinationAccount.id
      form.amountType = newRule.amountType
      form.amount = newRule.amount ? Number(newRule.amount) : undefined
      form.iterations = newRule.linkedIterations
        ? newRule.linkedIterations.map(li => ({
            id: li.id,
            percentage: li.percentage
          }))
        : []
      scope.value = props.hasCurrentPlan ? 'month' : 'global'
    } else {
      // Cas ChecklistStep (étape d'un plan mensuel)
      form.purposeName = newRule.name
      form.sourceAccountId = newRule.sourceAccountId
      form.transitAccountId = newRule.transitAccountId ? newRule.transitAccountId : 'none'
      form.destinationAccountId = newRule.destAccountId
      form.amountType = (newRule.amountType as 'fixed' | 'recurring') || 'fixed'
      form.amount = Number(newRule.amount)
      form.iterations = []
      scope.value = newRule.isMonthlyOverride ? 'month' : (props.hasCurrentPlan ? 'month' : 'global')
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const computeRecurringAmount = (): number => {
  let total = 0
  form.iterations.forEach((item) => {
    const it = props.iterations.find(i => i.id === item.id)
    if (it) {
      total += Number(it.amount || 0) * (item.percentage / 100)
    }
  })
  return total
}

const handleSubmit = async () => {
  if (!form.purposeName.trim()) {
    toast.add({ title: 'Le nom est requis', color: 'error' })
    return
  }
  if (!form.sourceAccountId) {
    toast.add({ title: 'Le compte source est requis', color: 'error' })
    return
  }
  if (!form.destinationAccountId) {
    toast.add({ title: 'Le compte destination est requis', color: 'error' })
    return
  }
  if (form.sourceAccountId === form.destinationAccountId) {
    toast.add({ title: 'La source et la destination doivent être différentes', color: 'error' })
    return
  }
  if (form.amountType === 'fixed' && !form.amount) {
    toast.add({ title: 'Le montant est requis', color: 'error' })
    return
  }
  if (form.amountType === 'recurring' && form.iterations.length === 0 && scope.value === 'global') {
    toast.add({ title: 'Sélectionnez au moins une transaction récurrente', color: 'error' })
    return
  }

  loading.value = true
  try {
    if (scope.value === 'month' && props.hasCurrentPlan) {
      // Sauvegarde ciblée sur le plan du mois en cours
      const sourceAccount = props.accounts.find(a => a.id === form.sourceAccountId)
      const destAccount = props.accounts.find(a => a.id === form.destinationAccountId)
      const transitAccount = form.transitAccountId !== 'none'
        ? props.accounts.find(a => a.id === form.transitAccountId)
        : null

      const calculatedAmount = form.amountType === 'fixed'
        ? Number(form.amount || 0)
        : (form.iterations.length > 0 ? computeRecurringAmount() : Number(form.amount || 0))

      const existingRuleId = props.rule
        ? ('ruleId' in props.rule ? props.rule.ruleId : props.rule.id)
        : `monthly-${Date.now()}`

      const step: ChecklistStep = {
        ruleId: existingRuleId,
        name: form.purposeName,
        sourceName: sourceAccount?.name || 'Source',
        sourceAccountId: form.sourceAccountId,
        transitName: transitAccount ? transitAccount.name : null,
        transitAccountId: transitAccount ? transitAccount.id : null,
        destName: destAccount?.name || 'Destination',
        destAccountId: form.destinationAccountId,
        amount: calculatedAmount,
        completed: (props.rule && 'completed' in props.rule) ? Boolean(props.rule.completed) : false,
        transitCompleted: (props.rule && 'transitCompleted' in props.rule) ? Boolean(props.rule.transitCompleted) : false,
        amountType: form.amountType,
        isMonthlyOverride: true
      }

      emit('saveMonthly', step)
      resetForm()
      handleClose()
    } else {
      // Sauvegarde dans le modèle global (transfer_rules)
      const globalRuleId = props.rule && 'sourceAccount' in props.rule ? props.rule.id : null
      const url = globalRuleId ? `/api/transfer-rules/${globalRuleId}` : '/api/transfer-rules'
      const method = globalRuleId ? 'PATCH' : 'POST'

      await $fetch(url, {
        method,
        body: {
          purposeName: form.purposeName,
          sourceAccountId: form.sourceAccountId,
          transitAccountId: form.transitAccountId === 'none' ? null : form.transitAccountId,
          destinationAccountId: form.destinationAccountId,
          amountType: form.amountType,
          amount: form.amountType === 'fixed' ? form.amount : undefined,
          iterations: form.amountType === 'recurring' ? form.iterations : undefined
        }
      })

      toast.add({
        title: globalRuleId ? 'Modèle global modifié avec succès' : 'Règle créée avec succès',
        color: 'success'
      })
      resetForm()
      emit('created')
      handleClose()
    }
  } catch {
    toast.add({ title: 'Erreur lors de l\'enregistrement de la règle', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppModal
    :open="open"
    :title="isEdit ? 'Modifier la règle de virement' : 'Créer une règle de virement'"
    :confirm-label="isEdit ? 'Enregistrer' : 'Créer'"
    confirm-color="primary"
    :loading="loading"
    @confirm="handleSubmit"
    @cancel="handleClose"
    @update:open="(val) => { if (!val) handleClose() }"
  >
    <div class="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
      <!-- Choix de portée (si plan de mois actif) -->
      <UFormField
        v-if="hasCurrentPlan"
        label="Portée de l'action"
        help="Choisissez si cette action s'applique uniquement au mois affiché ou au modèle permanent."
      >
        <USelect
          v-model="scope"
          :items="scopeOptions"
          class="w-full font-medium"
        />
      </UFormField>

      <!-- Nom -->
      <UFormField
        label="Nom de la règle"
        required
      >
        <UInput
          v-model="form.purposeName"
          placeholder="Ex : Épargne mensuelle, Loyer, Courses..."
          class="w-full"
        />
      </UFormField>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Compte source -->
        <UFormField
          label="Compte source"
          required
        >
          <USelect
            v-model="form.sourceAccountId"
            :items="accountOptions"
            placeholder="Compte source..."
            class="w-full"
          />
        </UFormField>

        <!-- Transit (optionnel) -->
        <UFormField label="Transit (Optionnel)">
          <USelect
            v-model="form.transitAccountId"
            :items="transitAccountOptions"
            placeholder="Compte de transit..."
            class="w-full"
          />
        </UFormField>

        <!-- Destination -->
        <UFormField
          label="Destination"
          required
        >
          <USelect
            v-model="form.destinationAccountId"
            :items="accountOptions"
            placeholder="Compte destination..."
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Type de montant -->
        <UFormField
          label="Type de montant"
          required
        >
          <USelect
            v-model="form.amountType"
            :items="amountTypeOptions"
            placeholder="Type de montant..."
            class="w-full"
          />
        </UFormField>

        <!-- Montant fixe -->
        <UFormField
          v-if="form.amountType === 'fixed'"
          label="Montant (€)"
          required
        >
          <UInput
            v-model.number="form.amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex : 500.00"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Itérations récurrentes (uniquement pour le modèle global ou calcul initial) -->
      <div
        v-if="form.amountType === 'recurring'"
        class="space-y-3 border border-black/10 dark:border-white/10 p-4 rounded-lg bg-black/5 dark:bg-white/5 max-h-60 overflow-y-auto"
      >
        <div class="text-xs font-bold text-gray-500 dark:text-gray-400 font-mono uppercase tracking-wider mb-2">
          Associer des transactions récurrentes
        </div>
        <div
          v-if="iterations.length === 0"
          class="text-xs text-gray-500 dark:text-gray-400 py-2 font-mono"
        >
          Aucune transaction ce mois-ci.
        </div>
        <div
          v-else
          class="space-y-2"
        >
          <div
            v-for="tx in iterations"
            :key="tx.id"
            class="flex items-center justify-between gap-4 p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <div class="flex items-center gap-2 flex-1">
              <UCheckbox
                :model-value="isTxSelected(tx.id)"
                @update:model-value="(val) => toggleTxSelection(tx.id, !!val)"
              />
              <div class="flex flex-col">
                <span class="text-xs font-bold text-gray-900 dark:text-white">{{ tx.name }}</span>
                <span class="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                  {{ formatAmount(Number(tx.amount)) }} ({{ tx.transaction.account.name }})
                </span>
              </div>
            </div>
            <div
              v-if="isTxSelected(tx.id)"
              class="flex items-center gap-1 w-20"
            >
              <UInput
                :model-value="getTxPercentage(tx.id)"
                type="number"
                min="1"
                max="100"
                class="font-mono text-xs w-14"
                placeholder="100"
                @update:model-value="(val) => updateTxPercentage(tx.id, Number(val))"
              />
              <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppModal>
</template>
