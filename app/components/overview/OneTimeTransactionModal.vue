<script setup lang="ts">
import { z } from 'zod'
import { formatDateForInput } from '~/utils'

import { startOfMonth } from 'date-fns'

const props = defineProps<{
  initialDate?: Date
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const toast = useToast()

const { data: accounts } = await useFetch<Array<{ id: string, name: string, isMain?: boolean }>>('/api/accounts')

const defaultAccountId = computed(() => {
  return accounts.value?.find(a => a.isMain)?.id || accounts.value?.[0]?.id || ''
})

const typeOptions = [
  { label: 'Dépense', value: 'expense' },
  { label: 'Revenu', value: 'income' }
]

const schema = z.object({
  name: z.string().min(1, 'Le nom de la transaction est requis'),
  amount: z.number({ message: 'Le montant est requis' }).positive('Le montant doit être positif'),
  accountId: z.string().uuid('Veuillez sélectionner un compte'),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'La date est requise')
})

const defaultDate = computed(() => {
  const baseDate = props.initialDate ? new Date(props.initialDate) : new Date()
  return formatDateForInput(startOfMonth(baseDate).toISOString())
})

const state = reactive({
  name: '',
  amount: undefined as number | undefined,
  accountId: defaultAccountId.value,
  type: 'expense' as 'income' | 'expense',
  date: defaultDate.value
})

watch(defaultDate, (newDate) => {
  state.date = newDate
})

watch(defaultAccountId, (newId) => {
  if (!state.accountId && newId) {
    state.accountId = newId
  }
}, { immediate: true })

const isSubmitting = ref(false)

const closeModal = () => {
  emit('close')
}

const handleSubmit = async () => {
  const result = schema.safeParse(state)
  if (!result.success) {
    toast.add({
      title: 'Formulaire invalide',
      description: result.error.issues[0]?.message || 'Veuillez vérifier les champs renseignés.',
      color: 'error'
    })
    return
  }

  isSubmitting.value = true
  try {
    const executionDate = new Date(state.date)
    await $fetch('/api/transactions', {
      method: 'POST',
      body: {
        name: state.name,
        amount: Number(state.amount),
        accountId: state.accountId,
        type: state.type,
        frequency: 'once',
        startDate: executionDate.toISOString(),
        endDate: executionDate.toISOString()
      }
    })

    toast.add({
      title: 'Transaction créée',
      description: 'La transaction a été ajoutée à ce mois.',
      color: 'success'
    })

    emit('success')
  } catch {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de créer la transaction.',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AppModal
    :open="true"
    title="Nouvelle transaction ponctuelle"
    @update:open="closeModal"
  >
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="handleSubmit"
    >
      <div class="grid grid-cols-2 gap-4">
        <UFormField
          label="Nom de la transaction"
          name="name"
        >
          <UInput
            v-model="state.name"
            placeholder="Ex: Loyer, Salaire, Billet de train..."
            class="w-full"
            autofocus
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

      <div class="grid grid-cols-2 gap-4">
        <UFormField
          label="Compte"
          name="accountId"
        >
          <USelectMenu
            v-model="state.accountId"
            :items="accounts ?? []"
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
            :items="typeOptions"
            value-key="value"
            label-key="label"
            class="w-full"
            :search-input="false"
          />
        </UFormField>
      </div>

      <UFormField
        label="Date"
        name="date"
      >
        <UInput
          v-model="state.date"
          type="date"
          placeholder="jj/mm/aaaa"
          class="w-full"
        />
      </UFormField>

      <div class="flex justify-end gap-2 pt-2 border-t border-default">
        <UButton
          color="neutral"
          variant="ghost"
          type="button"
          @click="closeModal"
        >
          Annuler
        </UButton>
        <UButton
          type="submit"
          color="primary"
          :loading="isSubmitting"
        >
          Ajouter la transaction
        </UButton>
      </div>
    </UForm>
  </AppModal>
</template>
