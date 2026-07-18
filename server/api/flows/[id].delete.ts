import { db } from '~~/server/database/db'
import { monthlyFlows } from '~~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })

  await db.delete(monthlyFlows).where(and(eq(monthlyFlows.id, id), eq(monthlyFlows.userId, userId)))

  return { success: true }
})
