<script setup lang="ts">
import type { TransactionIteration } from '~/types/overview'

const props = defineProps<{
  iteration: TransactionIteration
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const toast = useToast()

// Formulaire initialisé depuis l'itération reçue
const form = reactive({
  name: props.iteration.name,
  amount: props.iteration.amount,
  type: props.iteration.type as 'income' | 'expense',
  executionDate: props.iteration.executionDate
})

const typeOptions = [
  { label: 'Revenu', value: 'income' },
  { label: 'Dépense', value: 'expense' }
]

const isSubmitting = ref(false)

const closeModal = () => {
  emit('close')
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
  <UModal
    :open="true"
    @update:open="closeModal"
  >
    <template #header>
      <h3 class="font-semibold text-lg">
        Modifier l'itération
      </h3>
    </template>

    <template #body>
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
          <UInput
            v-model.number="form.amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="w-full"
          />
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
        <div class="flex justify-end gap-2 pt-2">
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
      </form>
    </template>
  </UModal>
</template>
