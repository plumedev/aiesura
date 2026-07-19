import { z } from 'zod'
import { requireUser } from '~~/server/utils/auth'
import { db } from '~~/server/database/db'
import { monthlyChecklists } from '~~/server/database/schema'
import { and, eq } from 'drizzle-orm'

const stepSchema = z.object({
  ruleId: z.string().uuid(),
  name: z.string(),
  sourceName: z.string(),
  sourceAccountId: z.string().uuid(),
  transitName: z.string().nullable(),
  transitAccountId: z.string().uuid().nullable(),
  destName: z.string(),
  destAccountId: z.string().uuid(),
  amount: z.number(),
  completed: z.boolean(),
  transitCompleted: z.boolean(),
  amountType: z.string()
})

const patchChecklistSchema = z.object({
  steps: z.array(stepSchema)
})

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID de la checklist manquant' })
  }

  const body = await readValidatedBody(event, body => patchChecklistSchema.safeParse(body))
  if (!body.success) {
    throw createError({ statusCode: 400, message: 'Données invalides', data: body.error.issues })
  }

  const { steps } = body.data

  const [updated] = await db
    .update(monthlyChecklists)
    .set({ steps })
    .where(and(
      eq(monthlyChecklists.id, id),
      eq(monthlyChecklists.userId, userId)
    ))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, message: 'Checklist introuvable ou accès non autorisé' })
  }

  return updated
})
