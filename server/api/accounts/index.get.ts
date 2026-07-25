import { db } from '~~/server/database/db'
import { accounts } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await requireUser(event)

    const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId))
    return userAccounts
  } catch (error) {
    console.error('[GET /api/accounts Error]:', error)
    const err = error as { statusCode?: number, message?: string }
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: err.message || 'Erreur lors de la récupération des comptes'
    })
  }
})
