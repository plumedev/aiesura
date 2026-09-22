import type { TransferRule, ChecklistStep } from '~/types'
import type { TransactionWithIterations, OverviewSummary } from '~/types/overview'

export const mockAccounts = [
  { id: 'acc-main', name: 'Compte Courant Principal', isMain: true, icon: 'i-heroicons-building-library', balance: 2450.80 },
  { id: 'acc-livret', name: 'Livret A (Sécurité)', isMain: false, icon: 'i-heroicons-circle-stack', balance: 12500.00 },
  { id: 'acc-projets', name: 'Compte Projets & Vacances', isMain: false, icon: 'i-heroicons-sparkles', balance: 1850.00 },
  { id: 'acc-pea', name: 'PEA Bourse (ETF World)', isMain: false, icon: 'i-heroicons-arrow-trending-up', balance: 6420.30 },
  { id: 'acc-pro', name: 'Compte Facturation / Pro', isMain: false, icon: 'i-heroicons-wallet', balance: 3200.00 }
]

export const mockSummary: OverviewSummary = {
  totalIncome: 3500.00,
  totalExpenses: 1895.50,
  balance: 1604.50
}

export const mockOverviewTransactions: TransactionWithIterations[] = [
  {
    id: 'tx-1',
    name: 'Salaire CDI Tech',
    type: 'income',
    account: { id: 'acc-pro', name: 'Compte Facturation / Pro' },
    iterationCount: 1,
    totalAmount: 3200.00,
    iterations: [
      {
        id: 'it-1',
        name: 'Salaire CDI Tech',
        type: 'income',
        amount: 3200.00,
        isModified: false,
        executionDate: '2026-10-01T08:00:00.000Z',
        transactionStartDate: '2026-10-01T08:00:00.000Z'
      }
    ]
  },
  {
    id: 'tx-bonus',
    name: 'Prime trimestrielle performance',
    type: 'income',
    account: { id: 'acc-pro', name: 'Compte Facturation / Pro' },
    iterationCount: 1,
    totalAmount: 300.00,
    iterations: [
      {
        id: 'it-bonus-1',
        name: 'Prime trimestrielle performance',
        type: 'income',
        amount: 300.00,
        isModified: true,
        executionDate: '2026-10-15T08:00:00.000Z',
        transactionStartDate: '2026-10-15T08:00:00.000Z'
      }
    ]
  },
  {
    id: 'tx-2',
    name: 'Loyer et charges appartement',
    type: 'expense',
    account: { id: 'acc-main', name: 'Compte Courant Principal' },
    iterationCount: 1,
    totalAmount: 950.00,
    iterations: [
      {
        id: 'it-2',
        name: 'Loyer et charges appartement',
        type: 'expense',
        amount: 950.00,
        isModified: false,
        executionDate: '2026-10-05T08:00:00.000Z',
        transactionStartDate: '2026-10-05T08:00:00.000Z'
      }
    ]
  },
  {
    id: 'tx-3',
    name: 'Courses hebdomadaires',
    type: 'expense',
    account: { id: 'acc-main', name: 'Compte Courant Principal' },
    iterationCount: 4,
    totalAmount: 520.00,
    iterations: [
      {
        id: 'it-3-1',
        name: 'Courses Semaine 1',
        type: 'expense',
        amount: 130.00,
        isModified: false,
        executionDate: '2026-10-03T10:00:00.000Z',
        transactionStartDate: '2026-10-03T10:00:00.000Z'
      },
      {
        id: 'it-3-2',
        name: 'Courses Semaine 2 (Dîner amis)',
        type: 'expense',
        amount: 175.00,
        isModified: true,
        executionDate: '2026-10-10T10:00:00.000Z',
        transactionStartDate: '2026-10-10T10:00:00.000Z'
      },
      {
        id: 'it-3-3',
        name: 'Courses Semaine 3',
        type: 'expense',
        amount: 115.00,
        isModified: false,
        executionDate: '2026-10-17T10:00:00.000Z',
        transactionStartDate: '2026-10-17T10:00:00.000Z'
      },
      {
        id: 'it-3-4',
        name: 'Courses Semaine 4',
        type: 'expense',
        amount: 100.00,
        isModified: false,
        executionDate: '2026-10-24T10:00:00.000Z',
        transactionStartDate: '2026-10-24T10:00:00.000Z'
      }
    ]
  },
  {
    id: 'tx-4',
    name: 'Abonnements récurrents (Fibre, Mobile, Cloud)',
    type: 'expense',
    account: { id: 'acc-main', name: 'Compte Courant Principal' },
    iterationCount: 3,
    totalAmount: 75.50,
    iterations: [
      {
        id: 'it-4-1',
        name: 'Fibre Optique',
        type: 'expense',
        amount: 39.99,
        isModified: false,
        executionDate: '2026-10-12T08:00:00.000Z',
        transactionStartDate: '2026-10-12T08:00:00.000Z'
      },
      {
        id: 'it-4-2',
        name: 'Forfait Mobile',
        type: 'expense',
        amount: 19.99,
        isModified: false,
        executionDate: '2026-10-18T08:00:00.000Z',
        transactionStartDate: '2026-10-18T08:00:00.000Z'
      },
      {
        id: 'it-4-3',
        name: 'Stockage Cloud Pro',
        type: 'expense',
        amount: 15.52,
        isModified: false,
        executionDate: '2026-10-28T08:00:00.000Z',
        transactionStartDate: '2026-10-28T08:00:00.000Z'
      }
    ]
  },
  {
    id: 'tx-5',
    name: 'Assurance habitation & véhicule',
    type: 'expense',
    account: { id: 'acc-main', name: 'Compte Courant Principal' },
    iterationCount: 1,
    totalAmount: 110.00,
    iterations: [
      {
        id: 'it-5-1',
        name: 'Assurance habitation & véhicule',
        type: 'expense',
        amount: 110.00,
        isModified: false,
        executionDate: '2026-10-08T08:00:00.000Z',
        transactionStartDate: '2026-10-08T08:00:00.000Z'
      }
    ]
  },
  {
    id: 'tx-6',
    name: 'Rentrée sportive & licence club',
    type: 'expense',
    account: { id: 'acc-main', name: 'Compte Courant Principal' },
    iterationCount: 1,
    totalAmount: 240.00,
    iterations: [
      {
        id: 'it-6-1',
        name: 'Rentrée sportive & licence club',
        type: 'expense',
        amount: 240.00,
        isModified: true,
        executionDate: '2026-10-02T14:00:00.000Z',
        transactionStartDate: '2026-10-02T14:00:00.000Z'
      }
    ]
  }
]

export const mockRules: TransferRule[] = [
  {
    id: 'rule-1',
    purposeName: 'Épargne de précaution (Livret A)',
    amountType: 'recurring',
    amount: null,
    order: 1,
    sourceAccount: { id: 'acc-pro', name: 'Compte Facturation / Pro' },
    transitAccount: { id: 'acc-main', name: 'Compte Courant Principal' },
    destinationAccount: { id: 'acc-livret', name: 'Livret A (Sécurité)' },
    linkedIterations: [
      {
        id: 'li-1',
        name: 'Salaire CDI Tech',
        amount: '3200',
        type: 'income',
        percentage: 20,
        executionDate: '2026-10-01T08:00:00.000Z',
        transaction: { account: { id: 'acc-pro', name: 'Compte Facturation / Pro' } }
      }
    ],
    createdAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'rule-2',
    purposeName: 'Provision Vacances & Projets',
    amountType: 'fixed',
    amount: '250',
    order: 2,
    sourceAccount: { id: 'acc-pro', name: 'Compte Facturation / Pro' },
    transitAccount: { id: 'acc-main', name: 'Compte Courant Principal' },
    destinationAccount: { id: 'acc-projets', name: 'Compte Projets & Vacances' },
    linkedIterations: [],
    createdAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'rule-3',
    purposeName: 'Investissement PEA ETF World (10%)',
    amountType: 'recurring',
    amount: null,
    order: 3,
    sourceAccount: { id: 'acc-pro', name: 'Compte Facturation / Pro' },
    transitAccount: { id: 'acc-main', name: 'Compte Courant Principal' },
    destinationAccount: { id: 'acc-pea', name: 'PEA Bourse (ETF World)' },
    linkedIterations: [
      {
        id: 'li-1',
        name: 'Salaire CDI Tech',
        amount: '3200',
        type: 'income',
        percentage: 10,
        executionDate: '2026-10-01T08:00:00.000Z',
        transaction: { account: { id: 'acc-pro', name: 'Compte Facturation / Pro' } }
      }
    ],
    createdAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'rule-4',
    purposeName: 'Loyer et charges fixes',
    amountType: 'fixed',
    amount: '950',
    order: 4,
    sourceAccount: { id: 'acc-main', name: 'Compte Courant Principal' },
    transitAccount: null,
    destinationAccount: { id: 'acc-rent', name: 'Propriétaire Appartement' },
    linkedIterations: [],
    createdAt: '2026-09-01T00:00:00.000Z'
  }
]

export const mockSteps: ChecklistStep[] = [
  {
    ruleId: 'rule-1',
    name: 'Épargne de précaution (20%)',
    sourceName: 'Compte Facturation / Pro',
    sourceAccountId: 'acc-pro',
    transitName: 'Compte Courant Principal',
    transitAccountId: 'acc-main',
    destName: 'Livret A (Sécurité)',
    destAccountId: 'acc-livret',
    amount: 640.00,
    completed: true,
    transitCompleted: true,
    amountType: 'recurring'
  },
  {
    ruleId: 'rule-2',
    name: 'Provision Vacances & Projets',
    sourceName: 'Compte Facturation / Pro',
    sourceAccountId: 'acc-pro',
    transitName: 'Compte Courant Principal',
    transitAccountId: 'acc-main',
    destName: 'Compte Projets & Vacances',
    destAccountId: 'acc-projets',
    amount: 250.00,
    completed: false,
    transitCompleted: true,
    amountType: 'fixed'
  },
  {
    ruleId: 'rule-3',
    name: 'Investissement PEA ETF World (10%)',
    sourceName: 'Compte Facturation / Pro',
    sourceAccountId: 'acc-pro',
    transitName: 'Compte Courant Principal',
    transitAccountId: 'acc-main',
    destName: 'PEA Bourse (ETF World)',
    destAccountId: 'acc-pea',
    amount: 320.00,
    completed: false,
    transitCompleted: true,
    amountType: 'recurring'
  },
  {
    ruleId: 'rule-4',
    name: 'Loyer et charges fixes',
    sourceName: 'Compte Courant Principal',
    sourceAccountId: 'acc-main',
    transitName: null,
    transitAccountId: null,
    destName: 'Propriétaire Appartement',
    destAccountId: 'acc-rent',
    amount: 950.00,
    completed: true,
    transitCompleted: false,
    amountType: 'fixed'
  }
]
