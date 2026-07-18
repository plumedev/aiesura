import { serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

/**
 * Récupère l'utilisateur authentifié et son ID depuis le contexte de la requête.
 * Lève une erreur 401 si l'utilisateur n'est pas connecté.
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

  return { user, userId }
}
