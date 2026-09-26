import { db } from '~~/server/database/db'
import { transactions } from '~~/server/database/schema'
import { eq, ne, and, desc, isNull, isNotNull } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const query = getQuery(event)
  const archived = query.archived as string | undefined

  const conditions = [
    eq(transactions.userId, userId),
    ne(transactions.frequency, 'once')
  ]

  if (archived === 'true') {
    conditions.push(isNotNull(transactions.archivedAt))
  } else if (archived !== 'all') {
    conditions.push(isNull(transactions.archivedAt))
  }

  const userTransactions = await db.query.transactions.findMany({
    where: and(...conditions),
    orderBy: [desc(transactions.startDate)],
    with: {
      account: true
    }
  })

  return userTransactions
})
