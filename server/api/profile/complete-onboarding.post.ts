import { db } from '~~/server/database/db'
import { profiles } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await requireUser(event)

    await db
      .update(profiles)
      .set({ onboarded: true })
      .where(eq(profiles.id, userId))

    return { success: true }
  } catch (error) {
    console.error('[POST /api/profile/complete-onboarding Error]:', error)
    const err = error as { statusCode?: number, message?: string }
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: err.message || 'Erreur lors de la finalisation de l\'onboarding'
    })
  }
})
