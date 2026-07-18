import { db } from '~~/server/database/db'
import { accounts } from '~~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })

  // Vérifier que le compte appartient à l'utilisateur et le supprimer
  const deletedAccounts = await db.delete(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    .returning()

  // S'il s'agissait du compte principal, on en définit un autre par défaut
  if (deletedAccounts.length > 0 && deletedAccounts[0]?.isMain) {
    const otherAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId)).limit(1)
    if (otherAccounts.length > 0 && otherAccounts[0]?.id) {
      await db.update(accounts)
        .set({ isMain: true })
        .where(eq(accounts.id, otherAccounts[0].id))
    }
  }

  return { success: true }
})
