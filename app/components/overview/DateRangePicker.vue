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
</script>

<template>
  <UPopover :content="{ align: 'start' }">
    <UInput
      readonly
      :model-value="label"
      icon="i-heroicons-calendar-days"
      class="font-medium cursor-pointer w-full sm:w-64"
      :ui="{ base: 'cursor-pointer' }"
    />

    <template #content>
      <div class="flex items-start sm:divide-x divide-default">
        <!-- Raccourcis -->
        <div class="flex flex-col py-4">
          <UButton
            v-for="range in ranges"
            :key="range.label"
            :label="range.label"
            color="neutral"
            :variant="isSelected(range) ? 'soft' : 'ghost'"
            class="rounded-none px-6 justify-start"
            @click="selectRange(range)"
          />
        </div>

        <!-- Calendrier -->
        <UCalendar
          :model-value="calValue"
          range
          :number-of-months="2"
          class="p-4"
          @update:model-value="onCalendarChange"
        />
      </div>
    </template>
  </UPopover>
</template>
