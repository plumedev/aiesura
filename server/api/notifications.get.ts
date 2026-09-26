import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  return []
})
