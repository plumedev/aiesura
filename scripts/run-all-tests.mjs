import { spawn } from 'child_process'

const isUi = process.argv.includes('ui') || process.argv.includes('--ui')

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const fullCmd = `${command} ${args.join(' ')}`
    console.log(`\n▶ Exécution : ${fullCmd}\n`)
    const child = spawn(fullCmd, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, JAVA_TOOL_OPTIONS: '-Dfile.encoding=UTF-8' }
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`La commande ${command} s'est terminée avec le code ${code}`))
      }
    })

    child.on('error', (err) => {
      reject(err)
    })
  })
}

async function main() {
  try {
    console.log('========================================')
    console.log('🧪 Lancement de la suite complète de tests')
    console.log(`Mode : ${isUi ? 'Navigateur visible (UI)' : 'Terminal (Headless)'}`)
    console.log('========================================')

    // 1. Tests unitaires (Vitest)
    console.log('\n--- [1/2] Tests unitaires (Vitest) ---')
    await runCommand('npx', ['vitest', 'run'])

    // 2. Tests fonctionnels E2E (Maestro)
    console.log('\n--- [2/2] Tests fonctionnels E2E (Maestro) ---')
    const maestroArgs = isUi
      ? ['test', 'tests/e2e/maestro/']
      : ['test', 'tests/e2e/maestro/', '--headless', '--screen-size', '1280x800']

    await runCommand('maestro', maestroArgs)

    console.log('\n========================================')
    console.log('✅ Tous les tests ont réussi avec succès !')
    console.log('========================================\n')
  } catch (err) {
    console.error(`\n❌ Échec des tests : ${err.message}\n`)
    process.exit(1)
  }
}

main()
