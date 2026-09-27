import { db } from '~~/server/database/db'
import { transactionIterations, transactions } from '~~/server/database/schema'
import { and, eq } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID manquant' })
  }

  // 1. Récupérer l'itération pour vérifier son existence, son userId et son transactionId
  const iteration = await db.query.transactionIterations.findFirst({
    where: and(
      eq(transactionIterations.id, id),
      eq(transactionIterations.userId, userId)
    )
  })

  if (!iteration) {
    throw createError({ statusCode: 404, message: 'Itération introuvable' })
  }

  // 2. Supprimer l'itération
  const deleted = await db
    .delete(transactionIterations)
    .where(
      and(
        eq(transactionIterations.id, id),
        eq(transactionIterations.userId, userId)
      )
    )
    .returning()

  if (deleted.length === 0) {
    throw createError({ statusCode: 404, message: 'Itération introuvable' })
  }

  // 3. S'il ne reste plus aucune itération pour la transaction parente, supprimer la transaction parente
  const remainingIterations = await db
    .select({ id: transactionIterations.id })
    .from(transactionIterations)
    .where(
      and(
        eq(transactionIterations.transactionId, iteration.transactionId),
        eq(transactionIterations.userId, userId)
      )
    )

  if (remainingIterations.length === 0) {
    await db
      .delete(transactions)
      .where(
        and(
          eq(transactions.id, iteration.transactionId),
          eq(transactions.userId, userId)
        )
      )
  }

  return { success: true }
})
