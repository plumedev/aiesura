import { db } from '~~/server/database/db'
import { accounts } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId))
  return userAccounts
})
