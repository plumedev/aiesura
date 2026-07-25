import { db } from '~~/server/database/db'
import { profiles } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const { user, userId } = await requireUser(event)

    let userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1)

    if (!userProfile[0]) {
      const name = (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur') as string
      const email = (user.email || `${userId}@placeholder.local`) as string

      try {
        const inserted = await db.insert(profiles).values({
          id: userId,
          name,
          email,
          onboarded: false
        }).returning()
        userProfile = inserted
      } catch {
        const inserted = await db.insert(profiles).values({
          id: userId,
          name,
          email: `${userId}@user.local`,
          onboarded: false
        }).onConflictDoNothing().returning()
        userProfile = inserted
      }
    }

    if (!userProfile[0]) {
      throw createError({
        statusCode: 404,
        message: 'Profil non trouvé'
      })
    }

    return userProfile[0]
  } catch (error) {
    console.error('[GET /api/profile Error]:', error)
    const err = error as { statusCode?: number, message?: string }
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: err.message || 'Erreur lors de la récupération du profil'
    })
  }
})
