import { db } from '~~/server/database/db'
import { transactions, transactionIterations, accounts } from '~~/server/database/schema'
import { serverSupabaseUser } from '#supabase/server'
import { and, eq, between, ilike, inArray, gte, lte, gt, lt, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.id || (user as { sub?: string })?.sub

  if (!user || !userId) {
    throw createError({ statusCode: 401, message: 'Non autorisé' })
  }

  const query = getQuery(event)
  const {
    startDate,
    endDate,
    search,
    type,
    accountId,
    amountRange,
    cursor,
    limit: rawLimit
  } = query

  if (!startDate || !endDate) {
    throw createError({ statusCode: 400, message: 'startDate et endDate sont requis' })
  }

  const start = new Date(startDate as string)
  const end = new Date(endDate as string)
  const pageSize = Math.min(Number(rawLimit ?? 20), 100)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw createError({ statusCode: 400, message: 'Dates invalides' })
  }

  // Construire les conditions sur les itérations
  const iterationConditions = [
    eq(transactionIterations.userId, userId),
    between(transactionIterations.executionDate, start, end)
  ]

  // Filtre par montant sur l'itération
  if (amountRange === 'small') {
    iterationConditions.push(lt(transactionIterations.amount, '50'))
  } else if (amountRange === 'medium') {
    iterationConditions.push(gte(transactionIterations.amount, '50'), lte(transactionIterations.amount, '500'))
  } else if (amountRange === 'large') {
    iterationConditions.push(gt(transactionIterations.amount, '500'))
  }

  // Construire les conditions sur les transactions parentes
  const txConditions = [eq(transactions.userId, userId)]

  if (search) {
    txConditions.push(ilike(transactions.name, `%${search}%`))
  }
  if (type === 'income' || type === 'expense') {
    txConditions.push(eq(transactions.type, type as string))
  }
  if (accountId) {
    const accountIds = Array.isArray(accountId) ? accountId : [accountId]
    txConditions.push(inArray(transactions.accountId, accountIds as string[]))
  }
  if (cursor) {
    txConditions.push(gt(transactions.id, cursor as string))
  }

  // Récupérer les transactions avec leurs itérations et le compte
  const txRows = await db
    .select()
    .from(transactions)
    .innerJoin(transactionIterations, eq(transactionIterations.transactionId, transactions.id))
    .innerJoin(accounts, eq(accounts.id, transactions.accountId))
    .where(and(...txConditions, ...iterationConditions))
    .orderBy(asc(transactions.id))

  // Grouper les itérations par transaction
  const txMap = new Map<string, {
    id: string
    name: string
    type: string
    account: { id: string, name: string }
    iterations: Array<{
      id: string
      executionDate: string
      amount: number
      name: string
      type: string
      isModified: boolean
    }>
  }>()

  for (const row of txRows) {
    const txId = row.transactions.id
    if (!txMap.has(txId)) {
      txMap.set(txId, {
        id: txId,
        name: row.transactions.name,
        type: row.transactions.type,
        account: { id: row.accounts.id, name: row.accounts.name },
        iterations: []
      })
    }
    txMap.get(txId)!.iterations.push({
      id: row.transaction_iterations.id,
      executionDate: row.transaction_iterations.executionDate.toISOString(),
      amount: Number(row.transaction_iterations.amount),
      name: row.transaction_iterations.name,
      type: row.transaction_iterations.type,
      isModified: row.transaction_iterations.isModified
    })
  }

  // Convertir en tableau avec les méta-données agrégées, puis paginer
  const allItems = Array.from(txMap.values()).map(tx => ({
    ...tx,
    iterationCount: tx.iterations.length,
    totalAmount: Math.round(tx.iterations.reduce((s, it) => s + it.amount, 0) * 100) / 100
  }))

  const pagedItems = allItems.slice(0, pageSize)
  const nextCursor = allItems.length > pageSize ? pagedItems[pagedItems.length - 1]?.id ?? null : null

  return {
    items: pagedItems,
    nextCursor
  }
})
