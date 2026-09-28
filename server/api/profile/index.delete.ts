import { db } from '~~/server/database/db'
import { profiles } from '~~/server/database/schema'
import { eq, sql } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  try {
    // 1. Supprimer le profil (cascade automatique sur accounts, transactions, flows, etc.)
    await db
      .delete(profiles)
      .where(eq(profiles.id, userId))

    // 2. Supprimer l'utilisateur dans la table auth.users de Supabase
    try {
      await db.execute(sql`DELETE FROM auth.users WHERE id = ${userId}::uuid`)
    } catch (authError) {
      console.warn('Avertissement lors de la suppression dans auth.users:', authError)
    }

    return { success: true, message: 'Compte supprimé avec succès' }
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la suppression du compte'
    })
  }
})
