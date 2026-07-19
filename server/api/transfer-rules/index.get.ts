import { requireUser } from '~~/server/utils/auth'
import { db } from '~~/server/database/db'
import { transferRules } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const rules = await db.query.transferRules.findMany({
    where: eq(transferRules.userId, userId),
    with: {
      sourceAccount: true,
      transitAccount: true,
      destinationAccount: true,
      linkedIterations: {
        with: {
          iteration: {
            with: {
              transaction: {
                with: {
                  account: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: (transferRules, { asc }) => [asc(transferRules.order), asc(transferRules.createdAt)]
  })

  return rules.map(rule => ({
    id: rule.id,
    purposeName: rule.purposeName,
    amountType: rule.amountType as 'fixed' | 'recurring',
    amount: rule.amount,
    order: rule.order,
    sourceAccount: rule.sourceAccount ? { id: rule.sourceAccount.id, name: rule.sourceAccount.name } : null,
    transitAccount: rule.transitAccount ? { id: rule.transitAccount.id, name: rule.transitAccount.name } : null,
    destinationAccount: rule.destinationAccount ? { id: rule.destinationAccount.id, name: rule.destinationAccount.name } : null,
    linkedIterations: rule.linkedIterations.map(li => ({
      id: li.iteration.id,
      name: li.iteration.name,
      amount: li.iteration.amount,
      type: li.iteration.type as 'income' | 'expense',
      percentage: li.percentage,
      executionDate: li.iteration.executionDate,
      transaction: {
        account: {
          id: li.iteration.transaction.account.id,
          name: li.iteration.transaction.account.name
        }
      }
    })),
    createdAt: rule.createdAt
  }))
})
