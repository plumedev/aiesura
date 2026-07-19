import { pgTable, text, timestamp, uuid, numeric, integer, boolean, primaryKey, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Core Entities ────────────────────────────────────────────────────────────

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  onboarded: boolean('onboarded').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  isMain: boolean('is_main').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'income' | 'expense'
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  name: text('name').notNull(),
  frequency: text('frequency').notNull(), // 'once' | 'monthly' | 'quarterly' | 'yearly'
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const monthlyFlows = pgTable('monthly_flows', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'income' | 'expense'
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  name: text('name').notNull(),
  frequency: text('frequency').notNull(), // 'once' | 'weekly' | 'monthly' | 'yearly'
  executionDay: integer('execution_day'),
  targetDate: timestamp('target_date'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const transactionIterations = pgTable('transaction_iterations', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  transactionId: uuid('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  executionDate: timestamp('execution_date').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'income' | 'expense'
  isModified: boolean('is_modified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// ─── Transfer Rules (AES-40) ──────────────────────────────────────────────────

export const transferRules = pgTable('transfer_rules', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  sourceAccountId: uuid('source_account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  transitAccountId: uuid('transit_account_id').references(() => accounts.id, { onDelete: 'set null' }),
  destinationAccountId: uuid('destination_account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  purposeName: text('purpose_name').notNull(),
  amountType: text('amount_type').notNull().default('fixed'), // 'fixed' | 'recurring'
  amount: numeric('amount', { precision: 10, scale: 2 }), // null if amountType = 'recurring'
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Liaison règle <-> itérations de transactions récurrentes (pour amountType = 'recurring')
export const transferRuleIterations = pgTable('transfer_rule_iterations', {
  transferRuleId: uuid('transfer_rule_id').notNull().references(() => transferRules.id, { onDelete: 'cascade' }),
  iterationId: uuid('iteration_id').notNull().references(() => transactionIterations.id, { onDelete: 'cascade' }),
  percentage: integer('percentage').notNull().default(100) // % de l'itération à inclure
}, t => ({
  pk: primaryKey({ columns: [t.transferRuleId, t.iterationId] })
}))

// Plan mensuel généré : checklist avec steps calculés
export const monthlyChecklists = pgTable('monthly_checklists', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  month: text('month').notNull(), // format 'YYYY-MM'
  salary: numeric('salary', { precision: 10, scale: 2 }).notNull().default('0'),
  selectedIncomeIds: jsonb('selected_income_ids').$type<string[]>().notNull().default([]),
  steps: jsonb('steps').$type<ChecklistStep[]>().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Type local pour le JSONB des steps (utilisé par Drizzle $type)
type ChecklistStep = {
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

// ─── Relations ────────────────────────────────────────────────────────────────

export const profilesRelations = relations(profiles, ({ many }) => ({
  accounts: many(accounts),
  transactions: many(transactions),
  transactionIterations: many(transactionIterations),
  transferRules: many(transferRules),
  monthlyChecklists: many(monthlyChecklists)
}))

export const accountsRelations = relations(accounts, ({ many, one }) => ({
  user: one(profiles, {
    fields: [accounts.userId],
    references: [profiles.id]
  }),
  transactions: many(transactions),
  monthlyFlows: many(monthlyFlows),
  outgoingTransferRules: many(transferRules, { relationName: 'outgoingRules' }),
  incomingTransferRules: many(transferRules, { relationName: 'incomingRules' }),
  transitTransferRules: many(transferRules, { relationName: 'transitRules' })
}))

export const monthlyFlowsRelations = relations(monthlyFlows, ({ one }) => ({
  account: one(accounts, {
    fields: [monthlyFlows.accountId],
    references: [accounts.id]
  })
}))

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id]
  }),
  user: one(profiles, {
    fields: [transactions.userId],
    references: [profiles.id]
  }),
  iterations: many(transactionIterations)
}))

export const transactionIterationsRelations = relations(transactionIterations, ({ one, many }) => ({
  transaction: one(transactions, {
    fields: [transactionIterations.transactionId],
    references: [transactions.id]
  }),
  user: one(profiles, {
    fields: [transactionIterations.userId],
    references: [profiles.id]
  }),
  linkedRules: many(transferRuleIterations)
}))

export const transferRulesRelations = relations(transferRules, ({ one, many }) => ({
  user: one(profiles, {
    fields: [transferRules.userId],
    references: [profiles.id]
  }),
  sourceAccount: one(accounts, {
    fields: [transferRules.sourceAccountId],
    references: [accounts.id],
    relationName: 'outgoingRules'
  }),
  transitAccount: one(accounts, {
    fields: [transferRules.transitAccountId],
    references: [accounts.id],
    relationName: 'transitRules'
  }),
  destinationAccount: one(accounts, {
    fields: [transferRules.destinationAccountId],
    references: [accounts.id],
    relationName: 'incomingRules'
  }),
  linkedIterations: many(transferRuleIterations)
}))

export const transferRuleIterationsRelations = relations(transferRuleIterations, ({ one }) => ({
  transferRule: one(transferRules, {
    fields: [transferRuleIterations.transferRuleId],
    references: [transferRules.id]
  }),
  iteration: one(transactionIterations, {
    fields: [transferRuleIterations.iterationId],
    references: [transactionIterations.id]
  })
}))

export const monthlyChecklistsRelations = relations(monthlyChecklists, ({ one }) => ({
  user: one(profiles, {
    fields: [monthlyChecklists.userId],
    references: [profiles.id]
  })
}))
