import { z } from 'zod'
import { requireUser } from '~~/server/utils/auth'
import { db } from '~~/server/database/db'
import { transactionIterations } from '~~/server/database/schema'
import { and, eq, gte, lt } from 'drizzle-orm'

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
  const parts = month.split('-').map(Number)
  const year = parts[0] ?? new Date().getFullYear()
  const monthNum = parts[1] ?? (new Date().getMonth() + 1)
  const startDate = new Date(year, monthNum - 1, 1)
  const endDate = new Date(year, monthNum, 1)

  const iterations = await db.query.transactionIterations.findMany({
    where: and(
      eq(transactionIterations.userId, userId),
      gte(transactionIterations.executionDate, startDate),
      lt(transactionIterations.executionDate, endDate)
    ),
    with: {
      transaction: {
        with: {
          account: true
        }
      }
    },
    orderBy: (ti, { asc }) => [asc(ti.executionDate)]
  })

  return iterations.map(it => ({
    id: it.id,
    name: it.name,
    amount: it.amount,
    type: it.type as 'income' | 'expense',
    executionDate: it.executionDate,
    transaction: {
      account: {
        id: it.transaction.account.id,
        name: it.transaction.account.name
      }
    }
  }))
})
