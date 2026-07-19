import type { AvatarProps } from '@nuxt/ui'

// Types spécifiques au projet — les types génériques du template de base ont été supprimés.

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

// Conservé pour NotificationsSlideover (à nettoyer quand ce composant sera remplacé)
interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

// ─── Flux Mensuels (AES-40) ──────────────────────────────────────────────────

export interface TransactionIteration {
  id: string
  name: string
  amount: string
  type: 'income' | 'expense'
  executionDate: string
  transaction: {
    account: { id: string, name: string }
  }
}

export interface LinkedIteration {
  id: string
  name: string
  amount: string
  type: 'income' | 'expense'
  percentage: number
  executionDate: string
  transaction: {
    account: { id: string, name: string }
  }
}

export interface TransferRule {
  id: string
  purposeName: string
  amountType: 'fixed' | 'recurring'
  amount: string | null
  order: number
  sourceAccount: { id: string, name: string }
  transitAccount: { id: string, name: string } | null
  destinationAccount: { id: string, name: string }
  linkedIterations: LinkedIteration[]
  createdAt: string
}

export interface ChecklistStep {
  ruleId: string
  name: string
  sourceName: string
  sourceAccountId: string
  transitName: string | null
  transitAccountId: string | null
  destName: string
  destAccountId: string
  amount: number
  completed: boolean
  transitCompleted: boolean
  amountType: string
}

export interface GroupedTransitStep {
  id: string
  sourceName: string
  transitName: string
  amount: number
  completed: boolean
  aggregatedRuleNames: string[]
}

export interface GroupedDispatchStep {
  id: string
  transitName: string
  destName: string
  amount: number
  completed: boolean
  subSteps: { name: string, amount: number }[]
}

export interface GroupedDirectStep {
  id: string
  sourceName: string
  destName: string
  amount: number
  completed: boolean
  subSteps: { name: string, amount: number }[]
}

export type GroupedStep = GroupedTransitStep | GroupedDispatchStep | GroupedDirectStep

export interface GroupedSteps {
  transits: GroupedTransitStep[]
  dispatches: GroupedDispatchStep[]
  directs: GroupedDirectStep[]
}

export interface MonthlyChecklist {
  id: string
  month: string
  salary: string
  selectedIncomeIds: string[]
  steps: ChecklistStep[]
}
