import { watchDebounced } from '@vueuse/core'
import { startOfMonth, endOfMonth } from 'date-fns'
import type {
  OverviewSummary,
  OverviewFilters,
  TransactionWithIterations,
  OverviewTransactionsResponse
} from '~/types/overview'
import { formatAmount } from '~/utils'

export const useOverview = () => {
  // --- Période ---
  const now = new Date()
  const dateRange = ref<{ start: Date, end: Date }>({
    start: startOfMonth(now),
    end: endOfMonth(now)
  })

  // --- Filtres ---
  const filters = reactive<OverviewFilters>({
    search: '',
    type: null,
    accountIds: [],
    amountRange: null
  })

  // --- KPI Summary ---
  const summary = ref<OverviewSummary>({ totalExpenses: 0, totalIncome: 0, balance: 0 })
  const summaryPending = ref(false)

  const fetchSummary = async () => {
    summaryPending.value = true
    try {
      const data = await $fetch<OverviewSummary>('/api/overview/summary', {
        query: {
          startDate: dateRange.value.start.toISOString(),
          endDate: dateRange.value.end.toISOString()
        }
      })
      summary.value = data
    } finally {
      summaryPending.value = false
    }
  }

  // --- Transactions (scroll infini) ---
  const items = ref<TransactionWithIterations[]>([])
  const nextCursor = ref<string | null>(null)
  const txPending = ref(false)
  const hasMore = computed(() => nextCursor.value !== null)

  const buildTxQuery = (cursor?: string | null) => {
    const q: Record<string, unknown> = {
      startDate: dateRange.value.start.toISOString(),
      endDate: dateRange.value.end.toISOString(),
      limit: 20
    }
    if (filters.search) q.search = filters.search
    if (filters.type) q.type = filters.type
    if (filters.accountIds.length > 0) q.accountId = filters.accountIds
    if (filters.amountRange) q.amountRange = filters.amountRange
    if (cursor) q.cursor = cursor
    return q
  }

  const fetchTransactions = async () => {
    txPending.value = true
    try {
      const data = await $fetch<OverviewTransactionsResponse>('/api/overview/transactions', {
        query: buildTxQuery()
      })
      items.value = data.items
      nextCursor.value = data.nextCursor
    } finally {
      txPending.value = false
    }
  }

  const loadMore = async () => {
    if (!hasMore.value || txPending.value) return
    txPending.value = true
    try {
      const data = await $fetch<OverviewTransactionsResponse>('/api/overview/transactions', {
        query: buildTxQuery(nextCursor.value)
      })
      items.value.push(...data.items)
      nextCursor.value = data.nextCursor
    } finally {
      txPending.value = false
    }
  }

  const refreshAll = async () => {
    nextCursor.value = null
    items.value = []
    await Promise.all([fetchSummary(), fetchTransactions()])
  }

  // Watcher : recharger automatiquement quand la période ou les filtres changent, avec un debounce de 400ms
  watchDebounced(
    [dateRange, () => filters.search, () => filters.type, () => filters.accountIds, () => filters.amountRange],
    () => {
      refreshAll()
    },
    { debounce: 400, deep: true }
  )

  return {
    // Période
    dateRange,
    // Filtres
    filters,
    // Summary
    summary,
    summaryPending,
    // Transactions
    items,
    txPending,
    hasMore,
    loadMore,
    refreshAll,
    // Formatage (réexporté depuis utils pour usage dans les templates)
    formatAmount
  }
}
