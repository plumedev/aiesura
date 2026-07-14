<script setup lang="ts">
import { z } from 'zod'
import { CalendarDate } from '@internationalized/date'

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

const state = reactive({
  name: '',
  amount: undefined,
  accountId: accounts.value?.[0]?.id || '',
  type: 'expense' as const,
  frequency: 'once' as const,
  startDate: new Date(),
  hasEndDate: true,
  endDate: new Date() as Date | undefined
})

const loading = ref(false)

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

async function onSubmit(event: import('@nuxt/ui').FormSubmitEvent<Record<string, unknown>>) {
  loading.value = true
  try {
    await $fetch('/api/transactions', {
      method: 'POST',
      body: {
        ...event.data,
        amount: Number(event.data.amount),
        startDate: (event.data.startDate as Date).toISOString(),
        endDate: (event.data.hasEndDate && event.data.endDate) ? (event.data.endDate as Date).toISOString() : null
      }
    })
    toast.add({ title: 'Transaction ajoutée', color: 'success' })
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
  }
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
        Ajouter
      </UButton>
    </div>
  </UForm>
</template>
