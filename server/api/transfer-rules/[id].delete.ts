import { requireUser } from '~~/server/utils/auth'
import { db } from '~~/server/database/db'
import { transferRules } from '~~/server/database/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID de règle manquant' })
  }

  const [deleted] = await db
    .delete(transferRules)
    .where(and(
      eq(transferRules.id, id),
      eq(transferRules.userId, userId)
    ))
    .returning()

  if (!deleted) {
    throw createError({ statusCode: 404, message: 'Règle introuvable ou accès non autorisé' })
  }

  return { success: true }
})
