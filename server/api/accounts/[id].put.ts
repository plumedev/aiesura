import { db } from '~~/server/database/db'
import { accounts } from '~~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { requireUser } from '~~/server/utils/auth'

const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isMain: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })

  const body = await readValidatedBody(event, body => updateAccountSchema.safeParse(body))

  if (!body.success) {
    throw createError({ statusCode: 400, message: 'Données invalides', data: body.error.issues })
  }

  const { name, icon, color, isMain } = body.data

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
