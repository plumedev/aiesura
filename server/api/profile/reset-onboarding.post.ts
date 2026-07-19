import { db } from '~~/server/database/db'
import { profiles } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  await db
    .update(profiles)
    .set({ onboarded: false })
    .where(eq(profiles.id, userId))

  return { success: true }
})
