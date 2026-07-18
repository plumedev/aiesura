import { db } from '~~/server/database/db'
import { monthlyFlows } from '~~/server/database/schema'
import { z } from 'zod'
import { requireUser } from '~~/server/utils/auth'

const flowSchema = z.object({
  accountId: z.string().uuid(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  name: z.string().min(1),
  frequency: z.enum(['once', 'weekly', 'monthly', 'yearly']),
  executionDay: z.number().int().min(1).max(31).optional().nullable(),
  targetDate: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional().default(true)
})

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const body = await readValidatedBody(event, body => flowSchema.safeParse(body))

  if (!body.success) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields', data: body.error.issues })
  }

  const { accountId, type, amount, name, frequency, executionDay, targetDate, isActive } = body.data

  const newFlow = await db.insert(monthlyFlows).values({
    userId,
    accountId,
    type,
    amount: String(amount),
    name,
    frequency,
    executionDay: executionDay ?? null,
    targetDate: targetDate ? new Date(targetDate) : null,
    isActive
  }).returning()

  return newFlow[0]
})
