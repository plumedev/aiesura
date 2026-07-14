import { db } from '~~/server/database/db'
import { transactions } from '~~/server/database/schema'
import { eq, desc } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  const userId = user?.id || (user as { sub?: string })?.sub

  if (!user || !userId) {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé'
    })
  }

  const userTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    orderBy: [desc(transactions.startDate)],
    with: {
      account: true
    }
  })

  return userTransactions
})
