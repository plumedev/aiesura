import { db } from '~~/server/database/db'
import { transactionIterations } from '~~/server/database/schema'
import { and, eq, between } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const { startDate, endDate } = getQuery(event)

  if (!startDate || !endDate) {
    throw createError({ statusCode: 400, message: 'startDate et endDate sont requis' })
  }

  const start = new Date(startDate as string)
  const end = new Date(endDate as string)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw createError({ statusCode: 400, message: 'Dates invalides' })
  }

  const iterations = await db
    .select()
    .from(transactionIterations)
    .where(
      and(
        eq(transactionIterations.userId, userId),
        between(transactionIterations.executionDate, start, end)
      )
    )

  let totalExpenses = 0
  let totalIncome = 0

  for (const iter of iterations) {
    const amount = Number(iter.amount)
    if (iter.type === 'expense') {
      totalExpenses += amount
    } else {
      totalIncome += amount
    }
  }

  return {
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    balance: Math.round((totalIncome - totalExpenses) * 100) / 100
  }
})
