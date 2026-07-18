import { addMonths, addQuarters, addYears, isBefore, isEqual } from 'date-fns'

/** Fréquences supportées par une transaction */
type Frequency = 'once' | 'monthly' | 'quarterly' | 'yearly'

/** Paramètres nécessaires pour générer les itérations */
export interface TransactionForGeneration {
  id: string
  userId: string
  name: string
  type: string
  amount: string
  frequency: Frequency
  startDate: Date
  endDate: Date | null
}

/** Une itération à insérer en BDD */
export interface IterationToInsert {
  transactionId: string
  userId: string
  executionDate: Date
  amount: string
  name: string
  type: string
}

/**
 * Génère toutes les itérations d'une transaction récurrente.
 *
 * - Si `endDate` est fournie, génère jusqu'à cette date.
 * - Si `endDate` est null (récurrence sans fin), génère sur un horizon de 24 mois.
 */
export function generateIterations(
  transaction: TransactionForGeneration
): IterationToInsert[] {
  const {
    id,
    userId,
    name,
    type,
    amount,
    frequency,
    startDate,
    endDate
  } = transaction

  // Horizon de fin : endDate fournie ou startDate + 24 mois
  const horizonEnd = endDate ?? addMonths(startDate, 24)

  const iterations: IterationToInsert[] = []

  // Cas fréquence unique : une seule itération à startDate
  if (frequency === 'once') {
    iterations.push({
      transactionId: id,
      userId,
      executionDate: startDate,
      amount,
      name,
      type
    })
    return iterations
  }

  // Générer les occurrences récurrentes
  let current = new Date(startDate)

  while (isBefore(current, horizonEnd) || isEqual(current, horizonEnd)) {
    iterations.push({
      transactionId: id,
      userId,
      executionDate: new Date(current),
      amount,
      name,
      type
    })

    // Avancer à l'occurrence suivante selon la fréquence
    if (frequency === 'monthly') {
      current = addMonths(current, 1)
    } else if (frequency === 'quarterly') {
      current = addQuarters(current, 1)
    } else if (frequency === 'yearly') {
      current = addYears(current, 1)
    } else {
      break // fréquence inconnue : sortir pour éviter une boucle infinie
    }
  }

  return iterations
}
