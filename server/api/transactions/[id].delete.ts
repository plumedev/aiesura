import { db } from '~~/server/database/db'
import { transactions } from '~~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID manquant' })
  }

  const deletedTransaction = await db.delete(transactions).where(
    and(
      eq(transactions.id, id),
      eq(transactions.userId, userId)
    )
  ).returning()

  if (!deletedTransaction.length) {
    throw createError({ statusCode: 404, message: 'Transaction introuvable' })
  }

  return { success: true }
})
