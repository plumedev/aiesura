import { db } from '~~/server/database/db'
import { transactions, transactionIterations } from '~~/server/database/schema'
import { and, eq, gte } from 'drizzle-orm'
import { z } from 'zod'
import { generateIterations } from '~~/server/utils/generateIterations'
import { requireUser } from '~~/server/utils/auth'

const patchTransactionSchema = z.object({
  accountId: z.string().uuid().optional(),
  type: z.enum(['income', 'expense']).optional(),
  amount: z.number().positive().optional(),
  name: z.string().min(1).optional(),
  frequency: z.enum(['once', 'monthly', 'quarterly', 'yearly']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().nullable().optional(),
  updateMode: z.enum(['single', 'all', 'future']).optional()
})

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID manquant' })
  }

  const body = await readValidatedBody(event, body => patchTransactionSchema.safeParse(body))
  if (!body.success) {
    throw createError({
      statusCode: 400,
      message: 'Données invalides',
      data: body.error.issues
    })
  }

  const data = body.data

  // Récupérer la transaction actuelle
  const existingTransaction = await db.query.transactions.findFirst({
    where: and(
      eq(transactions.id, id),
      eq(transactions.userId, userId)
    )
  })

  if (!existingTransaction) {
    throw createError({ statusCode: 404, message: 'Transaction introuvable' })
  }

  const updateMode = data.updateMode || (existingTransaction.frequency === 'once' ? 'single' : 'all')

  if (updateMode === 'single' || updateMode === 'all') {
    // 1. Mettre à jour la transaction
    const updateValues: Record<string, string | number | Date | null | undefined> = {}
    if (data.accountId !== undefined) updateValues.accountId = data.accountId
    if (data.type !== undefined) updateValues.type = data.type
    if (data.amount !== undefined) updateValues.amount = data.amount.toString()
    if (data.name !== undefined) updateValues.name = data.name
    if (data.frequency !== undefined) updateValues.frequency = data.frequency
    if (data.startDate !== undefined) updateValues.startDate = new Date(data.startDate)
    if (data.endDate !== undefined) updateValues.endDate = data.endDate ? new Date(data.endDate) : null

    const updated = await db
      .update(transactions)
      .set(updateValues)
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.userId, userId)
        )
      )
      .returning()

    const tx = updated[0]
    if (!tx) {
      throw createError({ statusCode: 500, message: 'Erreur lors de la mise à jour de la transaction' })
    }

    // 2. Récupérer les itérations déjà modifiées
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

    // 3. Supprimer les itérations non modifiées
    await db
      .delete(transactionIterations)
      .where(
        and(
          eq(transactionIterations.transactionId, id),
          eq(transactionIterations.userId, userId),
          eq(transactionIterations.isModified, false)
        )
      )

    // 4. Générer les nouvelles itérations
    const generated = generateIterations({
      id: tx.id,
      userId,
      name: tx.name,
      type: tx.type,
      amount: tx.amount,
      frequency: tx.frequency as 'once' | 'monthly' | 'quarterly' | 'yearly',
      startDate: tx.startDate,
      endDate: tx.endDate
    })

    // 5. Filtrer pour éviter les doublons avec les modifiées (par date)
    const modifiedDates = new Set(
      modifiedIterations.map(it => new Date(it.executionDate).toDateString())
    )
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

    return tx
  } else if (updateMode === 'future') {
    // Mode "future" : scission de la transaction
    const effectiveDateStr = data.startDate || new Date().toISOString()
    const effectiveDate = new Date(effectiveDateStr)

    // A. Fixer la date de fin de la transaction d'origine à la veille
    const dayBefore = new Date(effectiveDate)
    dayBefore.setDate(dayBefore.getDate() - 1)

    const updatedOriginal = await db
      .update(transactions)
      .set({ endDate: dayBefore })
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.userId, userId)
        )
      )
      .returning()

    const originalTx = updatedOriginal[0]
    if (!originalTx) {
      throw createError({ statusCode: 500, message: 'Erreur lors de la mise à jour de la transaction d\'origine' })
    }

    // B. Supprimer les itérations non modifiées de T1 à partir de la date d'effet
    await db
      .delete(transactionIterations)
      .where(
        and(
          eq(transactionIterations.transactionId, id),
          eq(transactionIterations.userId, userId),
          eq(transactionIterations.isModified, false),
          gte(transactionIterations.executionDate, effectiveDate)
        )
      )

    // C. Créer la nouvelle transaction (T2)
    const newTxValues = {
      userId,
      accountId: data.accountId || originalTx.accountId,
      type: data.type || originalTx.type,
      amount: data.amount ? data.amount.toString() : originalTx.amount,
      name: data.name || originalTx.name,
      frequency: data.frequency || originalTx.frequency,
      startDate: effectiveDate,
      endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : originalTx.endDate
    }

    const insertedNew = await db
      .insert(transactions)
      .values(newTxValues)
      .returning()

    const newTx = insertedNew[0]
    if (!newTx) {
      throw createError({ statusCode: 500, message: 'Erreur lors de la création de la nouvelle transaction scindée' })
    }

    // D. Transférer les itérations modifiées de T1 à T2 si date d'exécution >= date d'effet
    await db
      .update(transactionIterations)
      .set({ transactionId: newTx.id })
      .where(
        and(
          eq(transactionIterations.transactionId, id),
          eq(transactionIterations.userId, userId),
          eq(transactionIterations.isModified, true),
          gte(transactionIterations.executionDate, effectiveDate)
        )
      )

    // E. Récupérer les itérations modifiées réassignées à T2 pour éviter les doublons
    const modifiedIterationsNewTx = await db
      .select()
      .from(transactionIterations)
      .where(
        and(
          eq(transactionIterations.transactionId, newTx.id),
          eq(transactionIterations.userId, userId)
        )
      )

    // F. Générer et insérer les nouvelles itérations pour T2
    const generatedNew = generateIterations({
      id: newTx.id,
      userId,
      name: newTx.name,
      type: newTx.type,
      amount: newTx.amount,
      frequency: newTx.frequency as 'once' | 'monthly' | 'quarterly' | 'yearly',
      startDate: newTx.startDate,
      endDate: newTx.endDate
    })

    const modifiedDatesNewTx = new Set(
      modifiedIterationsNewTx.map(it => new Date(it.executionDate).toDateString())
    )
    const toInsertNew = generatedNew
      .filter(it => !modifiedDatesNewTx.has(new Date(it.executionDate).toDateString()))
      .map(it => ({
        transactionId: it.transactionId,
        userId: it.userId,
        executionDate: it.executionDate,
        amount: it.amount,
        name: it.name,
        type: it.type,
        isModified: false
      }))

    if (toInsertNew.length > 0) {
      await db.insert(transactionIterations).values(toInsertNew)
    }

    // G. Nettoyage : Supprimer la transaction d'origine si elle n'a plus d'itérations du tout
    const remainingIterations = await db
      .select()
      .from(transactionIterations)
      .where(
        and(
          eq(transactionIterations.transactionId, id),
          eq(transactionIterations.userId, userId)
        )
      )

    if (remainingIterations.length === 0) {
      await db
        .delete(transactions)
        .where(
          and(
            eq(transactions.id, id),
            eq(transactions.userId, userId)
          )
        )
    }

    return newTx
  }
})
