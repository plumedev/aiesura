import postgres from 'postgres'
import 'dotenv/config'

console.log('Testing DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING')
console.log('Testing SUPABASE_URL:', process.env.SUPABASE_URL)

async function test() {
  if (!process.env.DATABASE_URL) {
    console.error('No DATABASE_URL')
    return
  }
  const sql = postgres(process.env.DATABASE_URL, { connect_timeout: 5 })
  try {
    const res = await sql`SELECT 1 as connected`
    console.log('DB Query succeeded:', res)
  } catch (err) {
    console.error('DB Query failed:', err)
  } finally {
    await sql.end()
  }
}

test()
