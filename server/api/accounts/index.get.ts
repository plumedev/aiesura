import { serverSupabaseUser } from '#supabase/server'
import { db } from '~~/server/database/db'
import { accounts } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub
  
  if (!user || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId))
  return userAccounts
})
