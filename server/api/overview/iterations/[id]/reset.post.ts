import { db } from '~~/server/database/db'
import { transactionIterations } from '~~/server/database/schema'
import { and, eq } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID manquant' })
  }

  // 1. Récupérer l'itération avec sa transaction parente
  const iteration = await db.query.transactionIterations.findFirst({
    where: and(
      eq(transactionIterations.id, id),
      eq(transactionIterations.userId, userId)
    ),
    with: {
      transaction: true
    }
  })

  if (!iteration) {
    throw createError({ statusCode: 404, message: 'Itération introuvable' })
  }

  // 2. Mettre à jour l'itération avec les valeurs de la transaction parente
  const updated = await db
    .update(transactionIterations)
    .set({
      name: iteration.transaction.name,
      amount: iteration.transaction.amount,
      type: iteration.transaction.type,
      isModified: false
    })
    .where(
      and(
        eq(transactionIterations.id, id),
        eq(transactionIterations.userId, userId)
      )
    )
    .returning()

  if (updated.length === 0) {
    throw createError({ statusCode: 500, message: 'Erreur lors de la réinitialisation de l\'itération' })
  }

  return updated[0]
})
