<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, today } from '@internationalized/date'

const emit = defineEmits<{
  'update:modelValue': [value: { start: Date, end: Date }]
}>()

const props = defineProps<{
  modelValue: { start: Date, end: Date }
}>()

// Convertit un Date natif vers CalendarDate
function toCalendarDate(date: Date): CalendarDate {
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

// Convertit un CalendarDate vers Date natif
function toNativeDate(cd: CalendarDate, endOfDay = false): Date {
  const d = new Date(cd.year, cd.month - 1, cd.day)
  if (endOfDay) {
    d.setHours(23, 59, 59, 999)
  }
  return d
}

// Valeur interne du calendrier — on utilise any pour satisfaire le binding UCalendar range (reka-ui)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const calValue = ref<any>({
  start: toCalendarDate(props.modelValue.start),
  end: toCalendarDate(props.modelValue.end)
})

// Formatter d'affichage
const df = new DateFormatter('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

// Label du bouton trigger
const label = computed(() => {
  const s = calValue.value.start
  const e = calValue.value.end
  if (!s || !e) return 'Sélectionner une période'
  return `${df.format(s.toDate(getLocalTimeZone()))} – ${df.format(e.toDate(getLocalTimeZone()))}`
})

// Raccourcis
const now = today(getLocalTimeZone())

const ranges = [
  {
    label: 'Ce mois-ci',
    start: now.set({ day: 1 }),
    end: now.set({ day: 1 }).add({ months: 1 }).subtract({ days: 1 })
  },
  {
    label: 'Le mois prochain',
    start: now.set({ day: 1 }).add({ months: 1 }),
    end: now.set({ day: 1 }).add({ months: 2 }).subtract({ days: 1 })
  },
  {
    label: 'Cette année',
    start: new CalendarDate(now.year, 1, 1),
    end: new CalendarDate(now.year, 12, 31)
  },
  {
    label: 'L\'année suivante',
    start: new CalendarDate(now.year + 1, 1, 1),
    end: new CalendarDate(now.year + 1, 12, 31)
  },
  {
    label: 'L\'année précédente',
    start: new CalendarDate(now.year - 1, 1, 1),
    end: new CalendarDate(now.year - 1, 12, 31)
  }
]

const isSelected = (range: (typeof ranges)[0]) =>
  calValue.value.start?.toString() === range.start.toString()
  && calValue.value.end?.toString() === range.end.toString()

// Quand le calendrier change — UCalendar range émet DateRange | null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onCalendarChange = (val: any) => {
  if (!val?.start || !val?.end) return
  calValue.value = val
  emit('update:modelValue', {
    start: toNativeDate(val.start as CalendarDate),
    end: toNativeDate(val.end as CalendarDate, true)
  })
}

// Quand un raccourci est cliqué
const selectRange = (range: (typeof ranges)[0]) => {
  calValue.value = { start: range.start, end: range.end }
  emit('update:modelValue', {
    start: toNativeDate(range.start),
    end: toNativeDate(range.end, true)
  })
}

const { width } = useWindowSize()
const isMobile = computed(() => width.value > 0 && width.value < 640)
</script>

<template>
  <UPopover :content="{ align: 'start' }">
    <UInput
      readonly
      :model-value="label"
      icon="i-heroicons-calendar-days"
      placeholder="Sélectionner une période"
      class="cursor-pointer w-full sm:w-64"
      :ui="{ base: 'cursor-pointer' }"
    />

    <template #content>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-start divide-y sm:divide-y-0 sm:divide-x divide-default max-w-[95vw] sm:max-w-none">
        <!-- Raccourcis -->
        <div class="flex flex-row sm:flex-col overflow-x-auto py-2 sm:py-4 px-2 sm:px-0 divide-x sm:divide-x-0 divide-default shrink-0">
          <UButton
            v-for="range in ranges"
            :key="range.label"
            :label="range.label"
            variant="ghost"
            size="xs"
            :class="[
              'rounded-md sm:rounded-none px-3 sm:px-6 py-1.5 sm:py-2 justify-start font-medium transition-colors cursor-pointer shrink-0 text-xs sm:text-sm',
              isSelected(range)
                ? '!bg-[#0A332C] !text-white'
                : 'text-gray-700 dark:text-gray-300 hover:!bg-[#0A332C] hover:!text-white dark:hover:!bg-[#0A332C] dark:hover:!text-white'
            ]"
            @click="selectRange(range)"
          />
        </div>

        <!-- Calendrier -->
        <div class="overflow-x-auto">
          <UCalendar
            :model-value="calValue"
            range
            :number-of-months="isMobile ? 1 : 2"
            class="p-2 sm:p-4"
            @update:model-value="onCalendarChange"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
