import { serverSupabaseUser } from '#supabase/server'
import { db } from '~~/server/database/db'
import { monthlyFlows } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const userFlows = await db.select().from(monthlyFlows).where(eq(monthlyFlows.userId, user.id))
  return userFlows
})
