import { db } from '~~/server/database/db'
import { monthlyFlows } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const userFlows = await db.select().from(monthlyFlows).where(eq(monthlyFlows.userId, userId))
  return userFlows
})
