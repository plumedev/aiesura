<script setup lang="ts">
import type { TransactionIteration } from '~/types/overview'

const props = defineProps<{
  iteration: TransactionIteration
}>()

const emit = defineEmits<{
  close: []
  success: []
  delete: [iteration: TransactionIteration]
}>()

const toast = useToast()

// Formulaire initialisé depuis l'itération reçue.
// Si l'itération n'a pas été modifiée, on préremplit avec la date de la transaction par défaut (transactionStartDate).
// Sinon, on prend sa propre date d'exécution (executionDate).
// L'input HTML type="date" requiert le format YYYY-MM-DD (géré par le helper formatDateForInput).
// props.iteration.executionDate contient la date planifiée par défaut (si non modifiée) ou la date modifiée (si déjà modifiée).
const form = reactive({
  name: props.iteration.name,
  amount: props.iteration.amount,
  type: props.iteration.type as 'income' | 'expense',
  executionDate: formatDateForInput(props.iteration.executionDate)
})

const typeOptions = [
  { label: 'Revenu', value: 'income' },
  { label: 'Dépense', value: 'expense' }
]

const isSubmitting = ref(false)

const closeModal = () => {
  emit('close')
}

const setAmountToZero = () => {
  form.amount = 0
}

const handleDelete = () => {
  emit('delete', props.iteration)
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await $fetch(`/api/overview/iterations/${props.iteration.id}`, {
      method: 'PATCH',
      body: {
        name: form.name,
        amount: form.amount,
        type: form.type,
        executionDate: new Date(form.executionDate).toISOString()
      }
    })
    toast.add({
      title: 'Itération mise à jour',
      description: 'Les modifications ont été enregistrées.',
      color: 'success'
    })
    emit('success')
  } catch {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de mettre à jour l\'itération.',
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
    title="Modifier l'itération"
    @update:open="closeModal"
  >
    <form
      class="flex flex-col gap-4"
      @submit.prevent="handleSubmit"
    >
      <!-- Libellé -->
      <UFormField label="Libellé">
        <UInput
          v-model="form.name"
          placeholder="Nom de l'itération"
          class="w-full"
        />
      </UFormField>

      <!-- Montant -->
      <UFormField label="Montant (€)">
        <div class="flex items-center gap-2">
          <UInput
            v-model.number="form.amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="flex-1"
          />
          <UButton
            v-if="form.amount !== 0"
            type="button"
            color="neutral"
            variant="subtle"
            size="sm"
            @click="setAmountToZero"
          >
            0 €
          </UButton>
        </div>
      </UFormField>

      <!-- Type -->
      <UFormField label="Type">
        <USelectMenu
          v-model="form.type"
          :items="typeOptions"
          value-key="value"
          label-key="label"
          class="w-full"
        />
      </UFormField>

      <!-- Date d'exécution -->
      <UFormField label="Date d'exécution">
        <UInput
          v-model="form.executionDate"
          type="date"
          class="w-full"
        />
      </UFormField>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-2">
        <UButton
          variant="ghost"
          color="error"
          icon="i-heroicons-trash"
          type="button"
          @click="handleDelete"
        >
          Supprimer
        </UButton>
        <div class="flex justify-end gap-2">
          <UButton
            variant="ghost"
            color="neutral"
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
            Enregistrer
          </UButton>
        </div>
      </div>
    </form>
  </AppModal>
</template>
