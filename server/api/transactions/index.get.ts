import { db } from '~~/server/database/db'
import { transactions } from '~~/server/database/schema'
import { eq, ne, and, desc, isNull, isNotNull, lt } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const query = getQuery(event)
  const archived = query.archived as string | undefined

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // Auto-archivage transparent des transactions récurrentes dont la date de fin est dépassée
  await db
    .update(transactions)
    .set({ archivedAt: now })
    .where(
      and(
        eq(transactions.userId, userId),
        ne(transactions.frequency, 'once'),
        isNotNull(transactions.endDate),
        lt(transactions.endDate, now),
        isNull(transactions.archivedAt)
      )
    )

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
