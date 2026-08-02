import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'
import { db } from '~~/server/database/db'
import { monthlyChecklists } from '~~/server/database/schema'

const stepSchema = z.object({
  ruleId: z.string(),
  name: z.string(),
  sourceName: z.string(),
  sourceAccountId: z.string().optional().default(''),
  transitName: z.string().nullable().optional().transform(val => val ?? null),
  transitAccountId: z.string().nullable().optional().transform(val => val ?? null),
  destName: z.string(),
  destAccountId: z.string().optional().default(''),
  amount: z.number(),
  completed: z.boolean(),
  transitCompleted: z.boolean(),
  amountType: z.string()
})

const createChecklistSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format YYYY-MM requis'),
  salary: z.number().nonnegative(),
  selectedIncomeIds: z.array(z.string()),
  steps: z.array(stepSchema)
})

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const body = await readValidatedBody(event, body => createChecklistSchema.safeParse(body))
  if (!body.success) {
    throw createError({ statusCode: 400, message: 'Données invalides', data: body.error.issues })
  }

  const { month, salary, selectedIncomeIds, steps } = body.data

  try {
    const existing = await db.query.monthlyChecklists.findFirst({
      where: and(
        eq(monthlyChecklists.userId, userId),
        eq(monthlyChecklists.month, month)
      )
    })

    let checklist
    if (existing) {
      const [updated] = await db
        .update(monthlyChecklists)
        .set({
          salary: String(salary),
          selectedIncomeIds,
          steps
        })
        .where(eq(monthlyChecklists.id, existing.id))
        .returning()
      checklist = updated
    } else {
      const [inserted] = await db
        .insert(monthlyChecklists)
        .values({
          userId,
          month,
          salary: String(salary),
          selectedIncomeIds,
          steps
        })
        .returning()
      checklist = inserted
    }

    return checklist
  } catch (error: unknown) {
    console.error('Erreur lors de la sauvegarde de la checklist mensuelle:', error)
    const message = error instanceof Error ? error.message : String(error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la sauvegarde de la checklist mensuelle',
      data: message
    })
  }
})
