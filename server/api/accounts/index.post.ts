import { db } from '~~/server/database/db'
import { accounts } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireUser } from '~~/server/utils/auth'

const accountSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  icon: z.string().optional(),
  color: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)

  const body = await readValidatedBody(event, body => accountSchema.safeParse(body))

  if (!body.success) {
    throw createError({ statusCode: 400, message: 'Données invalides', data: body.error.issues })
  }

  const { name, icon, color } = body.data

  // Vérifier s'il a déjà des comptes pour définir isMain automatiquement
  const existingAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId))
  const isFirstAccount = existingAccounts.length === 0

  const newAccount = await db.insert(accounts).values({
    userId,
    name,
    icon,
    color,
    isMain: isFirstAccount
  }).returning()

  return newAccount[0]
})
