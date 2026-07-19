import { z } from 'zod'
import { requireUser } from '~~/server/utils/auth'
import { db } from '~~/server/database/db'
import { monthlyChecklists } from '~~/server/database/schema'

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

  const [checklist] = await db
    .insert(monthlyChecklists)
    .values({
      userId,
      month,
      salary: String(salary),
      selectedIncomeIds,
      steps
    })
    .onConflictDoUpdate({
      target: [monthlyChecklists.userId, monthlyChecklists.month],
      set: {
        salary: String(salary),
        selectedIncomeIds,
        steps
      }
    })
    .returning()

  return checklist
})
