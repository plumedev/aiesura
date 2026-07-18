import { describe, it, expect } from 'vitest'
import { generateIterations } from '../../server/utils/generateIterations'

const base = {
  id: 'tx-1',
  userId: 'user-1',
  name: 'Test',
  type: 'expense',
  amount: '100'
} as const

describe('generateIterations', () => {
  it('génère 1 itération pour une transaction unique (once)', () => {
    const result = generateIterations({
      ...base,
      frequency: 'once',
      startDate: new Date('2026-07-01'),
      endDate: null
    })
    expect(result).toHaveLength(1)
    expect(result[0]!.executionDate).toEqual(new Date('2026-07-01'))
  })

  it('génère le bon nombre d\'itérations mensuelles avec endDate', () => {
    const result = generateIterations({
      ...base,
      frequency: 'monthly',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-06-30')
    })
    // Janv, Fév, Mars, Avr, Mai, Juin = 6
    expect(result).toHaveLength(6)
    expect(result[0]!.executionDate).toEqual(new Date('2026-01-01'))
    expect(result[5]!.executionDate.getMonth()).toBe(5) // Juin = index 5
  })

  it('génère sur 24 mois si pas de endDate (mensuel)', () => {
    const start = new Date('2026-01-01')
    const result = generateIterations({
      ...base,
      frequency: 'monthly',
      startDate: start,
      endDate: null
    })
    // 25 itérations : du 1er jan au 1er jan+24mois inclus
    expect(result.length).toBe(25)
  })

  it('génère des itérations trimestrielles correctes', () => {
    const result = generateIterations({
      ...base,
      frequency: 'quarterly',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31')
    })
    // Janv, Avr, Juil, Oct = 4
    expect(result).toHaveLength(4)
  })

  it('génère des itérations annuelles correctes', () => {
    const result = generateIterations({
      ...base,
      frequency: 'yearly',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2026-12-31')
    })
    // 2024, 2025, 2026 = 3
    expect(result).toHaveLength(3)
  })

  it('copie le montant et le nom de la transaction dans chaque itération', () => {
    const result = generateIterations({
      ...base,
      frequency: 'once',
      startDate: new Date('2026-07-01'),
      endDate: null
    })
    expect(result[0]!.amount).toBe('100')
    expect(result[0]!.name).toBe('Test')
    expect(result[0]!.type).toBe('expense')
    expect(result[0]!.transactionId).toBe('tx-1')
    expect(result[0]!.userId).toBe('user-1')
  })
})
