import { MongooseUserRepository } from 'infra/repositories/mongodb/UserRepository'
import { IUserRepository } from 'app/repositories/IUserRepository'
import { GetUsersController } from 'presentation/http/controllers/User/getUsers'
import { IController } from 'presentation/http/controllers/IController'
import { IGetUsersUseCase } from 'app/useCases/user/getUsers'
import { GetUsersUseCase } from 'app/useCases/user/implementations/getUsers'

/**
 * Composer function for creating and configuring the components required to get all users.
 *
 * @function
 * @returns {IController} The configured get users controller.
 */
export function getUsersComposer(): IController {
  const userRepository: IUserRepository = new MongooseUserRepository()
  const getUsersUseCase: IGetUsersUseCase = new GetUsersUseCase(userRepository)
  const getUserController: IController = new GetUsersController(getUsersUseCase)

  return getUserController
}
