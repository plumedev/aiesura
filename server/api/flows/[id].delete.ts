import { serverSupabaseUser } from '#supabase/server'
import { db } from '~~/server/database/db'
import { monthlyFlows } from '~~/server/database/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })

  await db.delete(monthlyFlows).where(and(eq(monthlyFlows.id, id), eq(monthlyFlows.userId, user.id)))
  
  return { success: true }
})
