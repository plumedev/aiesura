export type TransactionType = 'income' | 'expense'
export type AmountRange = 'small' | 'medium' | 'large'

export interface OverviewSummary {
  totalExpenses: number
  totalIncome: number
  balance: number
}

export interface TransactionIteration {
  id: string
  executionDate: string
  amount: number
  name: string
  type: TransactionType
  isModified: boolean
  transactionStartDate: string
}

export interface TransactionWithIterations {
  id: string
  name: string
  type: TransactionType
  account: { id: string, name: string }
  iterationCount: number
  totalAmount: number
  iterations: TransactionIteration[]
}

export interface OverviewFilters {
  search: string
  type: TransactionType | null
  accountIds: string[]
  amountRange: AmountRange | null
}

export interface OverviewTransactionsResponse {
  items: TransactionWithIterations[]
  nextCursor: string | null
}
