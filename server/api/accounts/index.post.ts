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

  const body = await readBody(event)
  const { name, icon, color } = body

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }

  // Vérifier s'il a déjà des comptes
  const existingAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId))
  const isFirstAccount = existingAccounts.length === 0

  const newAccount = await db.insert(accounts).values({
    userId,
    name,
    icon,
    color,
    isMain: isFirstAccount
  }).returning()

  return newAccount[0]
})
