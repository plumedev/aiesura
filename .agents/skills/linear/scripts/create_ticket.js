import fs from 'fs'
import path from 'path'

// Helper function to read the API key from the local .env file
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
  console.error('Veuillez ajouter LINEAR_API_KEY=votre_cle_api dans le fichier .env de votre projet.')
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
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.error('Usage: node create_ticket.js <TeamKey> <Title> [Description]')
    process.exit(1)
  }

  const [teamKey, title, description] = args

  try {
    console.log(`Recherche de l'équipe (clé: ${teamKey})...`)
    // 1. Fetch the Team ID using the Key
    const teamQuery = `
      query {
        teams {
          nodes {
            id
            key
            name
          }
        }
      }
    `
    const teamData = await fetchLinear(teamQuery)

    const team = teamData.teams.nodes.find(t => t.key === teamKey)

    if (!team) {
      console.error(`Erreur: Aucune équipe trouvée avec la clé "${teamKey}".`)
      process.exit(1)
    }
    const teamId = team.id
    console.log(`Équipe trouvée : ${team.name} (${teamId})`)

    // 2. Create the Issue
    console.log(`Création du ticket : "${title}"...`)
    const createQuery = `
      mutation CreateIssue($teamId: String!, $title: String!, $description: String) {
        issueCreate(input: { teamId: $teamId, title: $title, description: $description }) {
          success
          issue {
            id
            title
            identifier
            url
          }
        }
      }
    `
    const createData = await fetchLinear(createQuery, { teamId, title, description: description || '' })

    if (createData.issueCreate.success && createData.issueCreate.issue) {
      const issue = createData.issueCreate.issue
      console.log('\n✅ Ticket Linear créé avec succès !')
      console.log(`- Identifiant : ${issue.identifier}`)
      console.log(`- Titre : ${issue.title}`)
      console.log(`- URL : ${issue.url}`)
    } else {
      console.error('Erreur lors de la création du ticket (success=false).')
    }
  } catch (err) {
    console.error(err.message)
  }
}

main()
