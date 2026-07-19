import { z } from 'zod'
import { requireUser } from '~~/server/utils/auth'
import { db } from '~~/server/database/db'
import { transferRules, transferRuleIterations } from '~~/server/database/schema'

const ruleIterationSchema = z.object({
  id: z.string().uuid(),
  percentage: z.number().int().min(1).max(100)
})

const createRuleSchema = z.object({
  purposeName: z.string().min(1, 'Le nom est requis'),
  sourceAccountId: z.string().uuid('ID compte source invalide'),
  transitAccountId: z.string().uuid('ID compte transit invalide').nullable().optional(),
  destinationAccountId: z.string().uuid('ID compte destination invalide'),
  amountType: z.enum(['fixed', 'recurring']),
  amount: z.number().positive('Le montant doit être positif').nullable().optional(),
  iterations: z.array(ruleIterationSchema).optional()
}).refine(
  data => data.sourceAccountId !== data.destinationAccountId,
  { message: 'Le compte source et la destination doivent être différents', path: ['destinationAccountId'] }
).refine(
  data => data.amountType !== 'fixed' || (data.amount !== null && data.amount !== undefined),
  { message: 'Le montant est requis pour le type "fixe"', path: ['amount'] }
).refine(
  data => data.amountType !== 'recurring' || (data.iterations && data.iterations.length > 0),
  { message: 'Sélectionnez au moins une transaction pour le type "récurrent"', path: ['iterations'] }
)

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const body = await readValidatedBody(event, body => createRuleSchema.safeParse(body))
  if (!body.success) {
    throw createError({ statusCode: 400, message: 'Données invalides', data: body.error.issues })
  }

  const { purposeName, sourceAccountId, transitAccountId, destinationAccountId, amountType, amount, iterations } = body.data

  const insertedRules = await db.insert(transferRules).values({
    userId,
    purposeName,
    sourceAccountId,
    transitAccountId: transitAccountId || null,
    destinationAccountId,
    amountType,
    amount: amountType === 'fixed' && amount !== undefined && amount !== null ? String(amount) : null,
    order: Math.floor(Date.now() / 1000)
  }).returning()

  const rule = insertedRules[0]
  if (!rule) {
    throw createError({ statusCode: 500, message: 'Erreur lors de la création de la règle' })
  }

  if (amountType === 'recurring' && iterations && iterations.length > 0) {
    await db.insert(transferRuleIterations).values(
      iterations.map(it => ({
        transferRuleId: rule.id,
        iterationId: it.id,
        percentage: it.percentage
      }))
    )
  }

  return rule
})
