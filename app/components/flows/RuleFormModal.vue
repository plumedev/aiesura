<script setup lang="ts">
import type { TransactionIteration, TransferRule } from '~/types'

interface Account {
  id: string
  name: string
}

const props = defineProps<{
  open: boolean
  rule?: TransferRule | null
  iterations: TransactionIteration[]
  accounts: Account[]
}>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const handleClose = () => emit('close')

const toast = useToast()
const loading = ref(false)
const isEdit = computed(() => !!props.rule)

const form = reactive({
  purposeName: '',
  sourceAccountId: '',
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
  form.sourceAccountId = props.accounts[0]?.id || ''
  form.transitAccountId = 'none'
  form.destinationAccountId = ''
  form.amountType = 'fixed'
  form.amount = undefined
  form.iterations = []
}

// Remplir le formulaire si on est en mode édition
watch(() => props.rule, (newRule) => {
  if (newRule) {
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
  } else {
    resetForm()
  }
}, { immediate: true })

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
  if (form.amountType === 'recurring' && form.iterations.length === 0) {
    toast.add({ title: 'Sélectionnez au moins une transaction', color: 'error' })
    return
  }

  loading.value = true
  try {
    const url = isEdit.value ? `/api/transfer-rules/${props.rule!.id}` : '/api/transfer-rules'
    const method = isEdit.value ? 'PATCH' : 'POST'

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

    toast.add({ title: isEdit.value ? 'Règle modifiée avec succès' : 'Règle créée avec succès', color: 'success' })
    resetForm()
    emit('created')
    handleClose()
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
    @update:open="handleClose"
  >
    <div class="space-y-4">
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
            placeholder="Source"
            class="w-full"
          />
        </UFormField>

        <!-- Transit (optionnel) -->
        <UFormField label="Transit (Optionnel)">
          <USelect
            v-model="form.transitAccountId"
            :items="transitAccountOptions"
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
            placeholder="Destination"
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
            placeholder="500"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Itérations récurrentes -->
      <div
        v-if="form.amountType === 'recurring'"
        class="space-y-3 border border-default p-4 rounded-lg bg-surface/50 max-h-60 overflow-y-auto"
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

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          :disabled="loading"
          @click="handleClose"
        >
          Annuler
        </UButton>
        <UButton
          :loading="loading"
          @click="handleSubmit"
        >
          {{ isEdit ? 'Enregistrer' : 'Créer' }}
        </UButton>
      </div>
    </template>
  </AppModal>
</template>
