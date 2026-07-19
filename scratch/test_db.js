import { db } from './server/database/db.js'
import { profiles } from './server/database/schema.js'

async function main() {
  try {
    console.log('Fetching profiles...')
    const result = await db.select().from(profiles)
    console.log('Result:', JSON.stringify(result, null, 2))
  } catch (err) {
    console.error('Error querying profiles:', err.message)
  }
}

main()
