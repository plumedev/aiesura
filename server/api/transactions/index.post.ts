import { db } from '~~/server/database/db'
import { transactions } from '~~/server/database/schema'
import { serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

const transactionSchema = z.object({
  accountId: z.string().uuid(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  name: z.string().min(1),
  frequency: z.enum(['once', 'monthly', 'quarterly', 'yearly']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional()
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  const userId = user?.id || (user as { sub?: string })?.sub

  if (!user || !userId) {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé'
    })
  }

  const body = await readValidatedBody(event, body => transactionSchema.safeParse(body))

  if (!body.success) {
    throw createError({
      statusCode: 400,
      message: 'Données invalides',
      data: body.error.issues
    })
  }

  const data = body.data

  const newTransaction = await db.insert(transactions).values({
    userId: userId,
    accountId: data.accountId,
    type: data.type,
    amount: data.amount.toString(),
    name: data.name,
    frequency: data.frequency,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : null
  }).returning()

  return newTransaction[0]
})
