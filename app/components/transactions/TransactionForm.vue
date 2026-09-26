<script setup lang="ts">
import { z } from 'zod'
import { CalendarDate } from '@internationalized/date'

const props = defineProps<{
  transaction?: {
    id: string
    name: string
    amount: string | number
    accountId: string
    type: 'income' | 'expense'
    frequency: 'once' | 'monthly' | 'quarterly' | 'yearly'
    startDate: string
    endDate: string | null
  }
}>()

const emit = defineEmits(['close', 'success'])

const toast = useToast()

const { data: accounts } = await useFetch<Array<{ id: string, name: string, isMain?: boolean }>>('/api/accounts')

const defaultAccountId = computed(() => {
  return accounts.value?.find(a => a.isMain)?.id || accounts.value?.[0]?.id || ''
})

const schema = z.object({
  name: z.string().min(1, 'Le libellé est requis'),
  amount: z.number({ message: 'Le montant est requis' }).positive('Le montant doit être positif'),
  accountId: z.string().uuid('Veuillez sélectionner un compte'),
  type: z.enum(['income', 'expense']),
  frequency: z.enum(['once', 'monthly', 'quarterly', 'yearly']),
  startDate: z.date(),
  hasEndDate: z.boolean(),
  endDate: z.date().optional()
}).refine((data) => {
  if (data.hasEndDate && !data.endDate) return false
  return true
}, {
  message: 'La date de fin est requise',
  path: ['endDate']
})

const isEdition = computed(() => !!props.transaction)
const showConfirmModal = ref(false)
const updateMode = ref<'all' | 'future' | 'single'>('all')

const state = reactive({
  name: '',
  amount: undefined as number | undefined,
  accountId: defaultAccountId.value,
  type: 'expense' as 'income' | 'expense',
  frequency: 'monthly' as 'once' | 'monthly' | 'quarterly' | 'yearly',
  startDate: new Date(),
  hasEndDate: false,
  endDate: undefined as Date | undefined
})

watch(defaultAccountId, (newId) => {
  if (!props.transaction && !state.accountId && newId) {
    state.accountId = newId
  }
}, { immediate: true })

watch(() => props.transaction, (newTx) => {
  if (newTx) {
    state.name = newTx.name
    state.amount = Number(newTx.amount)
    state.accountId = newTx.accountId
    state.type = newTx.type
    state.frequency = newTx.frequency
    state.startDate = new Date(newTx.startDate)
    state.hasEndDate = !!newTx.endDate
    state.endDate = newTx.endDate ? new Date(newTx.endDate) : undefined
  } else {
    state.name = ''
    state.amount = undefined
    state.accountId = defaultAccountId.value
    state.type = 'expense'
    state.frequency = 'once'
    state.startDate = new Date()
    state.hasEndDate = true
    state.endDate = new Date()
  }
}, { immediate: true })

const loading = ref(false)
const isSubmitting = ref(false)

type DateValue = { year: number, month: number, day: number }

function toDateValue(date: Date) {
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}
function fromDateValue(dateValue: DateValue) {
  return new Date(dateValue.year, dateValue.month - 1, dateValue.day)
}

const dateModel = computed({
  get() {
    if (state.hasEndDate) {
      return {
        start: state.startDate ? toDateValue(state.startDate) : undefined,
        end: state.endDate ? toDateValue(state.endDate) : undefined
      }
    }
    return state.startDate ? toDateValue(state.startDate) : undefined
  },
  set(val: DateValue | { start?: DateValue, end?: DateValue } | null | undefined) {
    if (state.hasEndDate) {
      const range = val as { start?: DateValue, end?: DateValue } | null | undefined
      state.startDate = range?.start ? fromDateValue(range.start) : new Date()
      state.endDate = range?.end ? fromDateValue(range.end) : undefined
    } else {
      const date = val as DateValue | null | undefined
      state.startDate = date ? fromDateValue(date) : new Date()
      state.endDate = undefined
    }
  }
})

const occurrenceCount = computed(() => {
  if (!state.hasEndDate || !state.startDate || !state.endDate) return 0
  const start = new Date(state.startDate)
  const end = new Date(state.endDate)

  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  if (end < start) return 0
  if (state.frequency === 'once') return 1

  let count = 0
  const current = new Date(start)

  while (current <= end) {
    count++
    if (state.frequency === 'monthly') {
      current.setMonth(current.getMonth() + 1)
    } else if (state.frequency === 'quarterly') {
      current.setMonth(current.getMonth() + 3)
    } else if (state.frequency === 'yearly') {
      current.setFullYear(current.getFullYear() + 1)
    }
  }

  return count
})

const selectedEffectiveDate = ref<string>('')
const customEffectiveDate = ref<string>('')

// Calcul des prochaines itérations attendues pour la transaction éditée
const futureIterationOptions = computed(() => {
  if (!props.transaction || props.transaction.frequency === 'once') return []

  const start = new Date(props.transaction.startDate)
  const end = props.transaction.endDate ? new Date(props.transaction.endDate) : null
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const options: Array<{ label: string, value: string }> = []
  const current = new Date(start)
  let count = 0

  while ((!end || current <= end) && count < 120) {
    count++
    const iterDate = new Date(current)
    iterDate.setHours(0, 0, 0, 0)

    if (iterDate >= now) {
      const formatted = iterDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      const isNext = options.length === 0
      options.push({
        label: isNext ? `${formatted} (prochaine itération)` : formatted,
        value: iterDate.toISOString()
      })
      if (options.length >= 12) break
    }

    if (props.transaction.frequency === 'monthly') {
      current.setMonth(current.getMonth() + 1)
    } else if (props.transaction.frequency === 'quarterly') {
      current.setMonth(current.getMonth() + 3)
    } else if (props.transaction.frequency === 'yearly') {
      current.setFullYear(current.getFullYear() + 1)
    }
  }

  options.push({
    label: 'Autre date personnalisée...',
    value: 'custom'
  })

  return options
})

watch(showConfirmModal, (isOpen) => {
  if (isOpen) {
    if (futureIterationOptions.value.length > 1) {
      selectedEffectiveDate.value = futureIterationOptions.value[0]!.value
    } else {
      selectedEffectiveDate.value = 'custom'
      customEffectiveDate.value = new Date().toISOString().split('T')[0]!
    }
  }
})

const closeConfirmModal = () => {
  showConfirmModal.value = false
}

async function executeSubmit(mode?: 'all' | 'future' | 'single') {
  loading.value = true
  if (mode !== 'single') {
    isSubmitting.value = true
  }
  try {
    let effectiveDateIso: string | undefined = undefined
    if (mode === 'future') {
      if (selectedEffectiveDate.value === 'custom' && customEffectiveDate.value) {
        effectiveDateIso = new Date(customEffectiveDate.value).toISOString()
      } else if (selectedEffectiveDate.value && selectedEffectiveDate.value !== 'custom') {
        effectiveDateIso = selectedEffectiveDate.value
      } else {
        effectiveDateIso = futureIterationOptions.value[0]?.value || new Date().toISOString()
      }
    }

    const payload = {
      name: state.name,
      amount: Number(state.amount),
      accountId: state.accountId,
      type: state.type,
      frequency: state.frequency,
      startDate: state.startDate.toISOString(),
      endDate: (state.hasEndDate && state.endDate) ? state.endDate.toISOString() : null,
      effectiveDate: effectiveDateIso,
      updateMode: mode
    }

    if (isEdition.value) {
      await $fetch(`/api/transactions/${props.transaction!.id}`, {
        method: 'PATCH',
        body: payload
      })
      toast.add({ title: 'Transaction mise à jour', color: 'success' })
    } else {
      await $fetch('/api/transactions', {
        method: 'POST',
        body: payload
      })
      toast.add({ title: 'Transaction ajoutée', color: 'success' })
    }
    emit('success')
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: 'Erreur',
      description: err.data?.message || 'Une erreur est survenue',
      color: 'error'
    })
  } finally {
    loading.value = false
    isSubmitting.value = false
    showConfirmModal.value = false
  }
}

async function onSubmit() {
  if (isEdition.value && state.frequency !== 'once') {
    showConfirmModal.value = true
  } else {
    await executeSubmit(isEdition.value ? 'single' : undefined)
  }
}

async function submitEdit(mode: 'all' | 'future') {
  updateMode.value = mode
  await executeSubmit(mode)
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField
        label="Nom de la transaction"
        name="name"
      >
        <UInput
          v-model="state.name"
          placeholder="Ex: Loyer, Salaire..."
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Montant (€)"
        name="amount"
      >
        <UInput
          v-model="state.amount"
          type="number"
          step="0.01"
          placeholder="Ex: 50.00"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField
        label="Compte"
        name="accountId"
      >
        <USelectMenu
          v-model="state.accountId"
          :items="accounts"
          value-key="id"
          label-key="name"
          placeholder="Sélectionner un compte"
          class="w-full"
          :search-input="false"
        />
      </UFormField>

      <UFormField
        label="Type"
        name="type"
      >
        <USelectMenu
          v-model="state.type"
          :items="[{ label: 'Dépense', value: 'expense' }, { label: 'Revenu', value: 'income' }]"
          value-key="value"
          label-key="label"
          class="w-full"
          :search-input="false"
        />
      </UFormField>
    </div>

    <UFormField
      label="Fréquence"
      name="frequency"
    >
      <UTabs
        v-model="state.frequency"
        :items="[
          { label: 'Mensuel', value: 'monthly' },
          { label: 'Trimestriel', value: 'quarterly' },
          { label: 'Annuel', value: 'yearly' }
        ]"
        :content="false"
        class="w-full"
      />
    </UFormField>

    <div class="flex flex-col sm:flex-row sm:justify-between items-start gap-4">
      <UFormField
        :label="state.hasEndDate ? 'Période' : 'Date'"
        name="date"
      >
        <UPopover>
          <UInputDate
            v-model="dateModel"
            :range="state.hasEndDate"
            icon="i-lucide-calendar"
          />
          <template #content>
            <UCalendar
              v-model="dateModel"
              :range="state.hasEndDate"
            />
          </template>
        </UPopover>
        <p
          v-if="state.hasEndDate && occurrenceCount > 0"
          class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1"
        >
          <UIcon
            name="i-lucide-info"
            class="w-3.5 h-3.5 shrink-0 text-[#0A332C] dark:text-[#50E8A8]"
          />
          <span>Soit <strong>{{ occurrenceCount }}</strong> transaction{{ occurrenceCount > 1 ? 's' : '' }} générée{{ occurrenceCount > 1 ? 's' : '' }}</span>
        </p>
      </UFormField>

      <div class="flex items-center gap-2 mt-7">
        <USwitch v-model="state.hasEndDate" />
        <span class="text-sm font-medium">Date de fin</span>
      </div>
    </div>

    <div class="flex justify-end gap-3 mt-6">
      <UButton
        color="neutral"
        variant="ghost"
        @click="emit('close')"
      >
        Annuler
      </UButton>
      <UButton
        type="submit"
        color="primary"
        :loading="loading"
      >
        {{ isEdition ? 'Enregistrer' : 'Ajouter' }}
      </UButton>
    </div>
  </UForm>

  <!-- Modale de confirmation pour transactions récurrentes -->
  <AppModal
    v-model:open="showConfirmModal"
    title="Appliquer les modifications"
  >
    <div class="flex flex-col gap-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Cette transaction est récurrente. Choisissez comment et à partir de quand appliquer ces modifications.
      </p>

      <div class="p-3.5 rounded-lg border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/20 flex flex-col gap-2">
        <label class="text-xs font-semibold text-gray-700 dark:text-gray-300">
          À partir de quelle itération ?
        </label>
        <USelectMenu
          v-model="selectedEffectiveDate"
          :items="futureIterationOptions"
          value-key="value"
          label-key="label"
          placeholder="Sélectionnez l'itération d'effet"
          class="w-full"
        />
        <div
          v-if="selectedEffectiveDate === 'custom'"
          class="pt-1"
        >
          <UInput
            v-model="customEffectiveDate"
            type="date"
            placeholder="YYYY-MM-DD"
            class="w-full"
          />
        </div>
        <p class="text-[11px] text-gray-500 dark:text-gray-400">
          Les itérations antérieures à cette date conserveront leurs montants et informations d'origine.
        </p>
      </div>

      <div class="flex flex-col gap-2 mt-1">
        <UButton
          color="primary"
          variant="solid"
          class="justify-center"
          :loading="isSubmitting && updateMode === 'future'"
          @click="submitEdit('future')"
        >
          Appliquer à partir de cette itération
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          class="justify-center"
          :loading="isSubmitting && updateMode === 'all'"
          @click="submitEdit('all')"
        >
          Toutes les itérations (passées et futures)
        </UButton>
      </div>
      <div class="flex justify-end mt-2 border-t border-default pt-3">
        <UButton
          color="neutral"
          variant="ghost"
          @click="closeConfirmModal"
        >
          Annuler
        </UButton>
      </div>
    </div>
  </AppModal>
</template>
