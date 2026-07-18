import { db } from '~~/server/database/db'
import { transactions } from '~~/server/database/schema'
import { eq, desc } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const userTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    orderBy: [desc(transactions.startDate)],
    with: {
      account: true
    }
  })

  return userTransactions
})
