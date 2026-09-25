<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    id: string
    activeId?: string | null
    actionsWidth?: number
    disabled?: boolean
  }>(),
  {
    activeId: null,
    actionsWidth: 116,
    disabled: false
  }
)

const emit = defineEmits<{
  'update:activeId': [id: string | null]
  'update:active-id': [id: string | null]
  'click': [event: MouseEvent]
}>()

const isOpen = computed(() => props.activeId === props.id)

const translateX = ref(0)
const isDragging = ref(false)

// Suivi du geste
let startX = 0
let startY = 0
let initialTranslateX = 0
let isHorizontalDrag: boolean | null = null

watch(
  () => isOpen.value,
  (opened) => {
    if (!isDragging.value) {
      translateX.value = opened ? -props.actionsWidth : 0
    }
  },
  { immediate: true }
)

const handleStart = (clientX: number, clientY: number) => {
  if (props.disabled) return
  startX = clientX
  startY = clientY
  initialTranslateX = translateX.value
  isDragging.value = true
  isHorizontalDrag = null
}

const handleMove = (clientX: number, clientY: number, preventFn?: () => void) => {
  if (!isDragging.value || props.disabled) return
  const deltaX = clientX - startX
  const deltaY = clientY - startY

  if (isHorizontalDrag === null) {
    if (Math.abs(deltaY) > 6 && Math.abs(deltaY) > Math.abs(deltaX)) {
      isHorizontalDrag = false
      isDragging.value = false
      return
    }
    if (Math.abs(deltaX) > 6 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isHorizontalDrag = true
    }
  }

  if (isHorizontalDrag) {
    if (preventFn) preventFn()
    let newX = initialTranslateX + deltaX
    if (newX > 0) {
      newX = newX * 0.2
    } else if (newX < -props.actionsWidth) {
      const overflow = newX + props.actionsWidth
      newX = -props.actionsWidth + overflow * 0.2
    }
    translateX.value = newX
  }
}

const handleEnd = () => {
  if (!isDragging.value || props.disabled) return
  isDragging.value = false

  const threshold = props.actionsWidth * 0.35
  if (translateX.value < -threshold) {
    translateX.value = -props.actionsWidth
    emit('update:activeId', props.id)
    emit('update:active-id', props.id)
  } else {
    translateX.value = 0
    if (isOpen.value) {
      emit('update:activeId', null)
      emit('update:active-id', null)
    }
  }
}

// 1. Touch Events (Smartphones iOS/Android)
const onTouchStart = (e: TouchEvent) => {
  const t = e.touches[0]
  if (t) {
    handleStart(t.clientX, t.clientY)
  }
}

const onTouchMove = (e: TouchEvent) => {
  const t = e.touches[0]
  if (t) {
    handleMove(t.clientX, t.clientY, () => {
      if (e.cancelable) {
        e.preventDefault()
      }
    })
  }
}

const onTouchEnd = () => {
  handleEnd()
}

// 2. Mouse Events (Desktop & émulation devtools / browser subagent)
const onMouseDown = (e: MouseEvent) => {
  if (props.disabled) return
  handleStart(e.clientX, e.clientY)

  const onMouseMove = (moveEvent: MouseEvent) => {
    handleMove(moveEvent.clientX, moveEvent.clientY, () => moveEvent.preventDefault())
  }

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    handleEnd()
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

// 3. Pointer Events (Pointeurs modernes & stylet)
const onPointerDown = (e: PointerEvent) => {
  if (props.disabled || e.pointerType === 'touch') return
  handleStart(e.clientX, e.clientY)

  const onPointerMove = (moveEvent: PointerEvent) => {
    handleMove(moveEvent.clientX, moveEvent.clientY, () => moveEvent.preventDefault())
  }

  const onPointerUp = () => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    handleEnd()
  }

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

const onRowClick = (e: MouseEvent) => {
  if (isOpen.value) {
    e.stopPropagation()
    translateX.value = 0
    emit('update:activeId', null)
    emit('update:active-id', null)
    return
  }
  emit('click', e)
}

const close = () => {
  translateX.value = 0
  if (isOpen.value) {
    emit('update:activeId', null)
    emit('update:active-id', null)
  }
}

defineExpose({ close })
</script>

<template>
  <div class="relative overflow-hidden rounded-xl border border-black/5 dark:border-white/5 bg-[#F1F5F3] dark:bg-[#0C3C32] select-none">
    <!-- Conteneur d'actions d'arrière-plan (droite) -->
    <div
      class="absolute right-2 inset-y-0 flex items-center gap-1.5 z-0"
      :style="{ width: `${actionsWidth - 8}px` }"
    >
      <slot
        name="actions"
        :close="close"
      />
    </div>

    <!-- Contenu glissant (premier plan) -->
    <div
      class="relative z-10 w-full bg-[#F1F5F3] dark:bg-[#0C3C32] will-change-transform cursor-pointer touch-pan-y"
      :style="{
        transform: `translate3d(${translateX}px, 0, 0)`,
        transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
      @mousedown="onMouseDown"
      @pointerdown="onPointerDown"
      @click="onRowClick"
    >
      <slot />
    </div>
  </div>
</template>
