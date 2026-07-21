<script setup lang="ts">
withDefaults(defineProps<{
  open: boolean
  title: string
  icon?: string
  iconClass?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'primary' | 'secondary' | 'neutral' | 'error' | 'warning' | 'success' | 'info'
  loading?: boolean
}>(), {
  iconClass: 'text-red-500',
  cancelLabel: 'Annuler',
  confirmColor: 'primary',
  loading: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const slots = useSlots()

const close = () => {
  emit('update:open', false)
}

const handleCancel = () => {
  emit('cancel')
  close()
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <UModal
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <UIcon
              v-if="icon"
              :name="icon"
              class="w-5 h-5 flex-shrink-0"
              :class="iconClass"
            />
            {{ title }}
          </h3>
        </template>

        <slot />

        <template
          v-if="slots.footer || confirmLabel"
          #footer
        >
          <slot name="footer">
            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-0 sm:space-x-3">
              <UButton
                :label="cancelLabel"
                color="neutral"
                variant="ghost"
                class="w-full justify-center sm:w-auto cursor-pointer"
                @click="handleCancel"
              />
              <UButton
                :label="confirmLabel"
                :color="confirmColor"
                :loading="loading"
                class="w-full justify-center sm:w-auto cursor-pointer"
                @click="handleConfirm"
              />
            </div>
          </slot>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
