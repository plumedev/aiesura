import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL as string

// Configuration optimale pour les fonctions serverless (Vercel) + Supabase Pooler (port 6543) :
// - prepare: false -> indispensable pour le mode Transaction de PgBouncer / Supabase Pooler
// - max: 1 -> limite à 1 connexion par instance serverless
// - idle_timeout: 1 -> ferme rapidement les connexions inactives pour éviter les sockets obsolètes sur Vercel
const client = postgres(connectionString, {
  prepare: false,
  max: 1,
  idle_timeout: 1
})
export const db = drizzle(client, { schema })
