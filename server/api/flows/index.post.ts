import { serverSupabaseUser } from '#supabase/server'
import { db } from '~~/server/database/db'
import { monthlyFlows } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readBody(event)
  const { accountId, type, amount, name, frequency, executionDay, targetDate, isActive } = body

  if (!accountId || !type || !amount || !name || !frequency) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const newFlow = await db.insert(monthlyFlows).values({
    userId: user.id,
    accountId,
    type,
    amount: String(amount),
    name,
    frequency,
    executionDay: executionDay || null,
    targetDate: targetDate ? new Date(targetDate) : null,
    isActive: isActive !== undefined ? isActive : true
  }).returning()

  return newFlow[0]
})
