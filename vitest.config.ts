import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    hookTimeout: 30000,
    testTimeout: 30000
  }
})
