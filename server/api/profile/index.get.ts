import { db } from '~~/server/database/db'
import { profiles } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const userProfile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)

  if (!userProfile[0]) {
    throw createError({
      statusCode: 404,
      message: 'Profil non trouvé'
    })
  }

  return userProfile[0]
})
