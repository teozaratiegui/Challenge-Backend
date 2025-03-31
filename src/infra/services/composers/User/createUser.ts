import { MongooseUserRepository } from 'infra/repositories/mongodb/UserRepository';
import { IUserRepository } from 'app/repositories/IUserRepository';
import { CreateUserController } from 'presentation/http/controllers/User/createUser';
import { IController } from 'presentation/http/controllers/IController';
import { ICreateUserUseCase } from 'app/useCases/user/createUsers';
import { CreateUserUseCase } from 'app/useCases/user/implementations/createUsers';

/**
 * Composer function for creating and configuring the components required for user creation.
 *
 * @function
 * @returns {IController} The configured user creation controller.
 */

export function createUserComposer(): IController {
  const userRepository: IUserRepository = new MongooseUserRepository()
  const createUserUseCase: ICreateUserUseCase = new CreateUserUseCase(
    userRepository,
  )
  const createUserController: IController = new CreateUserController(
    createUserUseCase,
  )

  return createUserController
}    

