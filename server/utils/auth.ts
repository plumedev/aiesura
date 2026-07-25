import { serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'
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
    const existing = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1)

    if (!existing[0]) {
      const name = (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur') as string
      const email = (user.email || `${userId}@placeholder.local`) as string

      try {
        await db.insert(profiles).values({
          id: userId,
          name,
          email,
          onboarded: false
        })
      } catch (insertErr) {
        console.warn('[requireUser] Email conflict, inserting with unique fallback email:', insertErr)
        await db.insert(profiles).values({
          id: userId,
          name,
          email: `${userId}@user.local`,
          onboarded: false
        }).onConflictDoNothing()
      }
    }
  } catch (err) {
    console.error('[requireUser Sync Error]:', err)
  }

  return { user, userId }
}
