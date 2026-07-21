import { serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'
import { db } from '~~/server/database/db'
import { profiles } from '~~/server/database/schema'

/**
 * Récupère l'utilisateur authentifié et son ID depuis le contexte de la requête.
 * Lève une erreur 401 si l'utilisateur n'est pas connecté.
 * S'assure également que le profil existe dans la base de données PostgreSQL
 * afin d'éviter toute violation de clé étrangère (ex: création de comptes, transactions).
 *
 * Usage dans un handler :
 * ```ts
 * const { userId } = await requireUser(event)
 * ```
 */
export async function requireUser(event: H3Event) {
  const user = await serverSupabaseUser(event)
  const userId = user?.id ?? user?.sub

  if (!user || !userId) {
    throw createError({ statusCode: 401, message: 'Non autorisé' })
  }

  try {
    const name = (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur') as string
    const email = (user.email || `${userId}@placeholder.local`) as string

    await db.insert(profiles).values({
      id: userId,
      name,
      email,
      onboarded: false
    }).onConflictDoNothing()
  } catch (err) {
    console.error('Erreur lors de la synchronisation du profil utilisateur:', err)
  }

  return { user, userId }
}
