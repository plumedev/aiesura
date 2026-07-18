import type { AvatarProps } from '@nuxt/ui'

// Types spécifiques au projet — les types génériques du template de base ont été supprimés.

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

// Conservé pour NotificationsSlideover (à nettoyer quand ce composant sera remplacé)
interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}
