import { pgTable, text, timestamp, uuid, numeric, integer, boolean, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
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
  targetDate: timestamp('target_date'), // useful if frequency = 'once'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const transferRules = pgTable('transfer_rules', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  sourceAccountId: uuid('source_account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  destinationAccountId: uuid('destination_account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  purposeName: text('purpose_name').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }), // Nullable
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const transferRuleFlows = pgTable('transfer_rule_flows', {
  transferRuleId: uuid('transfer_rule_id').notNull().references(() => transferRules.id, { onDelete: 'cascade' }),
  monthlyFlowId: uuid('monthly_flow_id').notNull().references(() => monthlyFlows.id, { onDelete: 'cascade' })
}, t => ({
  pk: primaryKey({ columns: [t.transferRuleId, t.monthlyFlowId] })
}))

// Relations setup for easier querying
export const accountsRelations = relations(accounts, ({ many, one }) => ({
  user: one(profiles, {
    fields: [accounts.userId],
    references: [profiles.id]
  }),
  transactions: many(transactions),
  monthlyFlows: many(monthlyFlows),
  outgoingTransferRules: many(transferRules, { relationName: 'outgoingRules' }),
  incomingTransferRules: many(transferRules, { relationName: 'incomingRules' })
}))

export const monthlyFlowsRelations = relations(monthlyFlows, ({ one, many }) => ({
  account: one(accounts, {
    fields: [monthlyFlows.accountId],
    references: [accounts.id]
  }),
  transferRuleFlows: many(transferRuleFlows)
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id]
  }),
  user: one(profiles, {
    fields: [transactions.userId],
    references: [profiles.id]
  })
}))

export const transferRulesRelations = relations(transferRules, ({ one, many }) => ({
  sourceAccount: one(accounts, {
    fields: [transferRules.sourceAccountId],
    references: [accounts.id],
    relationName: 'outgoingRules'
  }),
  destinationAccount: one(accounts, {
    fields: [transferRules.destinationAccountId],
    references: [accounts.id],
    relationName: 'incomingRules'
  }),
  transferRuleFlows: many(transferRuleFlows)
}))

export const transferRuleFlowsRelations = relations(transferRuleFlows, ({ one }) => ({
  transferRule: one(transferRules, {
    fields: [transferRuleFlows.transferRuleId],
    references: [transferRules.id]
  }),
  monthlyFlow: one(monthlyFlows, {
    fields: [transferRuleFlows.monthlyFlowId],
    references: [monthlyFlows.id]
  })
}))
