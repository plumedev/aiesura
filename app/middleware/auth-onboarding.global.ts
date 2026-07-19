export default defineNuxtRouteMiddleware(async (to) => {
  const publicPages = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/confirm',
    '/update-password'
  ]

  if (publicPages.includes(to.path) || to.path === '/dashboard/onboarding') {
    return
  }

  const user = useSupabaseUser()
  if (!user.value) {
    return
  }

  const userId = user.value.id
  // Dictionnaire indexé par userId pour éviter les collisions de cache lors des changements d'utilisateur
  const onboardedStateMap = useState<Record<string, boolean>>('users-onboarded-map', () => ({}))

  if (onboardedStateMap.value[userId] === undefined) {
    try {
      const profile = await $fetch('/api/profile')
      onboardedStateMap.value[userId] = profile.onboarded
    } catch (error) {
      console.error('Erreur lors de la récupération du statut d\'onboarding:', error)
      return
    }
  }

  if (onboardedStateMap.value[userId] === false) {
    return navigateTo('/dashboard/onboarding')
  }
})
