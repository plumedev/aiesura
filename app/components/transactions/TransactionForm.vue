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

const { data: accounts } = await useFetch('/api/accounts')

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
  accountId: accounts.value?.[0]?.id || '',
  type: 'expense' as 'income' | 'expense',
  frequency: 'once' as 'once' | 'monthly' | 'quarterly' | 'yearly',
  startDate: new Date(),
  hasEndDate: true,
  endDate: new Date() as Date | undefined
})

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
    state.accountId = accounts.value?.[0]?.id || ''
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

async function executeSubmit(mode?: 'all' | 'future' | 'single') {
  loading.value = true
  if (mode !== 'single') {
    isSubmitting.value = true
  }
  try {
    const payload = {
      name: state.name,
      amount: Number(state.amount),
      accountId: state.accountId,
      type: state.type,
      frequency: state.frequency,
      startDate: state.startDate.toISOString(),
      endDate: (state.hasEndDate && state.endDate) ? state.endDate.toISOString() : null,
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
    <div class="grid grid-cols-2 gap-4">
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
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-2 gap-4">
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
          { label: 'Unique', value: 'once' },
          { label: 'Mensuel', value: 'monthly' },
          { label: 'Trimestriel', value: 'quarterly' },
          { label: 'Annuel', value: 'yearly' }
        ]"
        :content="false"
        class="w-full"
      />
    </UFormField>

    <div class="flex justify-between items-start">
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
        Cette transaction est récurrente. Comment souhaitez-vous appliquer vos modifications ?
      </p>
      <div class="flex flex-col gap-2 mt-2">
        <UButton
          color="primary"
          variant="solid"
          class="justify-center"
          :loading="isSubmitting && updateMode === 'future'"
          @click="submitEdit('future')"
        >
          Uniquement les prochaines itérations
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
      <div class="flex justify-end mt-4 border-t border-default pt-4">
        <UButton
          color="neutral"
          variant="ghost"
          @click="showConfirmModal = false"
        >
          Annuler
        </UButton>
      </div>
    </div>
  </AppModal>
</template>
