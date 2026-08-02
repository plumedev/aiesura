import fs from 'fs'
import path from 'path'

function getLinearApiKey() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return null

  const envFile = fs.readFileSync(envPath, 'utf8')
  const match = envFile.match(/^LINEAR_API_KEY=["']?([^"'\r\n]+)["']?$/m)
  return match ? match[1] : null
}

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || getLinearApiKey()

if (!LINEAR_API_KEY) {
  console.error('ERREUR : La clé d\'API Linear est manquante.')
  process.exit(1)
}

const LINEAR_API_URL = 'https://api.linear.app/graphql'

async function fetchLinear(query, variables = {}) {
  const response = await fetch(LINEAR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': LINEAR_API_KEY
    },
    body: JSON.stringify({ query, variables })
  })

  const data = await response.json()
  if (data.errors) {
    throw new Error('Erreur API Linear: ' + JSON.stringify(data.errors, null, 2))
  }
  return data.data
}

async function main() {
  const issueIdentifier = process.argv[2] || 'AES-43'
  console.log(`Récupération du ticket ${issueIdentifier}...`)

  const issueQuery = `
    query IssueByIdentifier($id: String!) {
      issue(id: $id) {
        id
        identifier
        title
        description
        state {
          name
        }
        priority
        creator {
          name
        }
        assignee {
          name
        }
        url
      }
    }
  `

  try {
    const data = await fetchLinear(issueQuery, { id: issueIdentifier })
    console.log(JSON.stringify(data.issue, null, 2))
  } catch (err) {
    console.error(err.message)
  }
}

main()
