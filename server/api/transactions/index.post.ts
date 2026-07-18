import { db } from '~~/server/database/db'
import { transactions, transactionIterations } from '~~/server/database/schema'
import { serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'
import { generateIterations } from '~~/server/utils/generateIterations'

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

  const tx = newTransaction[0]

  if (!tx) {
    throw createError({ statusCode: 500, message: 'Erreur lors de la création de la transaction' })
  }

  // Générer et persister les itérations planifiées
  const iterationsToInsert = generateIterations({
    id: tx.id,
    userId,
    name: tx.name,
    type: tx.type,
    amount: tx.amount,
    frequency: tx.frequency as 'once' | 'monthly' | 'quarterly' | 'yearly',
    startDate: tx.startDate,
    endDate: tx.endDate ?? null
  })

  if (iterationsToInsert.length > 0) {
    await db.insert(transactionIterations).values(iterationsToInsert)
  }

  return tx
})
