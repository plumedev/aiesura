// ─── Labels partagés ───────────────────────────────────────────────────────

export const TRANSACTION_TYPE_LABELS: Record<'income' | 'expense', string> = {
  income: 'Revenu',
  expense: 'Dépense'
}

export const FREQUENCY_LABELS: Record<string, string> = {
  once: 'Unique',
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  yearly: 'Annuel'
}

// ─── Formatage ─────────────────────────────────────────────────────────────

/**
 * Formate une chaîne ISO ou un objet Date en date locale française (jj/mm/aaaa).
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Traduit un identifiant de fréquence en libellé français.
 */
export function formatFrequency(freq: string): string {
  return FREQUENCY_LABELS[freq] ?? freq
}

/**
 * Formate un montant en euros avec signe selon le type de transaction.
 */
export function formatAmount(amount: number, type?: 'income' | 'expense'): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(Math.abs(amount))

  if (type === 'expense') return `-${formatted}`
  if (type === 'income') return `+${formatted}`
  return formatted
}

/**
 * Formate une date en chaîne 'YYYY-MM-DD' requise par les inputs HTML de type date.
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().substring(0, 10)
}
