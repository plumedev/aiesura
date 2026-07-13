import { serverSupabaseUser } from '#supabase/server'
import { db } from '~~/server/database/db'
import { accounts } from '~~/server/database/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub

  if (!user || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })

  const body = await readBody(event)
  const { name, icon, color, isMain } = body

  // Si on passe ce compte en principal, on réinitialise les autres
  if (isMain === true) {
    await db.update(accounts)
      .set({ isMain: false })
      .where(eq(accounts.userId, userId))
  }

  const updatedAccount = await db.update(accounts)
    .set({
      ...(name !== undefined && { name }),
      ...(icon !== undefined && { icon }),
      ...(color !== undefined && { color }),
      ...(isMain !== undefined && { isMain })
    })
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    .returning()

  return updatedAccount[0]
})
