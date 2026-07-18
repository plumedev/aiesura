import { db } from '~~/server/database/db'
import { transactionIterations } from '~~/server/database/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireUser } from '~~/server/utils/auth'

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  executionDate: z.string().datetime().optional()
})

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID manquant' })
  }

  const body = await readValidatedBody(event, body => patchSchema.safeParse(body))

  if (!body.success) {
    throw createError({
      statusCode: 400,
      message: 'Données invalides',
      data: body.error.issues
    })
  }

  const data = body.data

  // Construire les champs à mettre à jour
  const updateValues: Record<string, unknown> = { isModified: true }

  if (data.name !== undefined) updateValues.name = data.name
  if (data.amount !== undefined) updateValues.amount = data.amount.toString()
  if (data.type !== undefined) updateValues.type = data.type
  if (data.executionDate !== undefined) updateValues.executionDate = new Date(data.executionDate)

  // S'assurer que l'itération appartient bien à l'utilisateur courant
  const updated = await db
    .update(transactionIterations)
    .set(updateValues)
    .where(
      and(
        eq(transactionIterations.id, id),
        eq(transactionIterations.userId, userId)
      )
    )
    .returning()

  if (updated.length === 0) {
    throw createError({ statusCode: 404, message: 'Itération introuvable' })
  }

  return updated[0]
})
