import { db } from '~~/server/database/db'
import { transactions, transactionIterations } from '~~/server/database/schema'
import { and, eq, gte } from 'drizzle-orm'
import { z } from 'zod'
import { requireUser } from '~~/server/utils/auth'
import { generateIterations } from '~~/server/utils/generateIterations'

const archiveSchema = z.object({
  archive: z.boolean()
})

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID manquant' })
  }

  const body = await readValidatedBody(event, body => archiveSchema.safeParse(body))
  if (!body.success) {
    throw createError({
      statusCode: 400,
      message: 'Données invalides',
      data: body.error.issues
    })
  }

  const { archive } = body.data

  const existing = await db.query.transactions.findFirst({
    where: and(
      eq(transactions.id, id),
      eq(transactions.userId, userId)
    )
  })

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Transaction introuvable' })
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  if (archive) {
    // 1. Marquer comme archivée
    const updated = await db
      .update(transactions)
      .set({ archivedAt: new Date() })
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning()

    // 2. Supprimer les itérations futures non modifiées pour les exclure des flux futurs
    await db
      .delete(transactionIterations)
      .where(
        and(
          eq(transactionIterations.transactionId, id),
          eq(transactionIterations.userId, userId),
          eq(transactionIterations.isModified, false),
          gte(transactionIterations.executionDate, now)
        )
      )

    return updated[0]
  } else {
    // 1. Désarchiver
    const updated = await db
      .update(transactions)
      .set({ archivedAt: null })
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning()

    const tx = updated[0]
    if (!tx) {
      throw createError({ statusCode: 500, message: 'Erreur lors du désarchivage' })
    }

    // 2. Si récurrente et non expirée, régénérer les itérations futures
    if (tx.frequency !== 'once' && (!tx.endDate || new Date(tx.endDate) >= now)) {
      const modifiedIterations = await db
        .select()
        .from(transactionIterations)
        .where(
          and(
            eq(transactionIterations.transactionId, id),
            eq(transactionIterations.userId, userId),
            eq(transactionIterations.isModified, true)
          )
        )

      const modifiedDates = new Set(
        modifiedIterations.map(it => new Date(it.executionDate).toDateString())
      )

      const regenStart = new Date(tx.startDate) > now ? new Date(tx.startDate) : now

      const generated = generateIterations({
        id: tx.id,
        userId,
        name: tx.name,
        type: tx.type,
        amount: tx.amount,
        frequency: tx.frequency as 'once' | 'monthly' | 'quarterly' | 'yearly',
        startDate: regenStart,
        endDate: tx.endDate
      })

      const toInsert = generated
        .filter(it => !modifiedDates.has(new Date(it.executionDate).toDateString()))
        .map(it => ({
          transactionId: it.transactionId,
          userId: it.userId,
          executionDate: it.executionDate,
          amount: it.amount,
          name: it.name,
          type: it.type,
          isModified: false
        }))

      if (toInsert.length > 0) {
        await db.insert(transactionIterations).values(toInsert)
      }
    }

    return tx
  }
})
