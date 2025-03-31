import { Request, Response, Router } from 'express'

import { createUserComposer } from 'infra/services/composers/User/createUser'
import { expressAdapter } from 'presentation/adapters/expressAdapter'
import { ensureAuthenticated } from 'presentation/express/middlewares/ensureAuthenticated'
import { getUsersComposer } from 'infra/services/composers/User/getUsers'

/**
 * Router for handling user-related routes.
 */
const userRoutes = Router()

/**
 * Endpoint to create a new user.
 */
userRoutes.post('/', async (request: Request, response: Response): Promise<any> => {
  const adapter = await expressAdapter(request, createUserComposer())
  return response.status(adapter.statusCode).json(adapter.body)
})

/**
 * Endpoint to get user information (requires authentication).
 */


userRoutes.get(
  '/',
  ensureAuthenticated,
  async (request: Request, response: Response): Promise<any> => {
    const adapter = await expressAdapter(request, getUsersComposer())
    return response.status(adapter.statusCode).json(adapter.body)
  },
)

export { userRoutes }