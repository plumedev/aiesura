import { z } from 'zod'
import { requireUser } from '~~/server/utils/auth'
import { db } from '~~/server/database/db'
import { monthlyChecklists } from '~~/server/database/schema'
import { and, eq } from 'drizzle-orm'

const querySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format attendu : YYYY-MM')
})

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const query = getQuery(event)
  const parsed = querySchema.safeParse(query)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Paramètre month invalide (format attendu : YYYY-MM)' })
  }

  const { month } = parsed.data

  const [checklist] = await db
    .select()
    .from(monthlyChecklists)
    .where(and(
      eq(monthlyChecklists.userId, userId),
      eq(monthlyChecklists.month, month)
    ))
    .limit(1)

  return checklist || null
})
