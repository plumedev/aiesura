import { z } from 'zod'
import { requireUser } from '~~/server/utils/auth'
import { db } from '~~/server/database/db'
import { transferRules, transferRuleIterations } from '~~/server/database/schema'
import { and, eq } from 'drizzle-orm'

const ruleIterationSchema = z.object({
  id: z.string().uuid(),
  percentage: z.number().int().min(1).max(100)
})

const patchRuleSchema = z.object({
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
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID de règle manquant' })
  }

  const body = await readValidatedBody(event, body => patchRuleSchema.safeParse(body))
  if (!body.success) {
    throw createError({ statusCode: 400, message: 'Données invalides', data: body.error.issues })
  }

  const { purposeName, sourceAccountId, transitAccountId, destinationAccountId, amountType, amount, iterations } = body.data

  // Utiliser une transaction pour mettre à jour la règle et ses liaisons
  const updatedRule = await db.transaction(async (tx) => {
    const [rule] = await tx
      .update(transferRules)
      .set({
        purposeName,
        sourceAccountId,
        transitAccountId: transitAccountId || null,
        destinationAccountId,
        amountType,
        amount: amountType === 'fixed' && amount !== undefined && amount !== null ? String(amount) : null
      })
      .where(and(
        eq(transferRules.id, id),
        eq(transferRules.userId, userId)
      ))
      .returning()

    if (!rule) {
      throw createError({ statusCode: 404, message: 'Règle introuvable ou accès non autorisé' })
    }

    // Nettoyer les anciennes itérations
    await tx
      .delete(transferRuleIterations)
      .where(eq(transferRuleIterations.transferRuleId, id))

    // Insérer les nouvelles itérations si récurrent
    if (amountType === 'recurring' && iterations && iterations.length > 0) {
      await tx.insert(transferRuleIterations).values(
        iterations.map(it => ({
          transferRuleId: id,
          iterationId: it.id,
          percentage: it.percentage
        }))
      )
    }

    return rule
  })

  return updatedRule
})
