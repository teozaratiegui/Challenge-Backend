import { ResponseDTO } from '../../../../domain/dtos/Response'
import { ICreateUserRequestDTO } from '../../../../domain/dtos/User/ICreateUserRequestDTO'
import { UserEntity } from '../../../../domain/entities/User'
import { UserErrorType } from '../../../../domain/enums/user/ErrorType'
import { IUserRepository } from 'app/repositories/IUserRepository'
import { ICreateUserUseCase } from 'app/useCases/user/createUsers'

/**
 * Use case for creating a new user.
 *
 * @class
 * @implements {ICreateUserUseCase}
 */
export class CreateUserUseCase implements ICreateUserUseCase {
  /**
   * Creates an instance of CreateUserUseCase.
   *
   * @constructor
   * @param {IUsersRepository} userRepository - The repository for user data.
   * @param {IPasswordHasher} passwordHasher - The password hasher provider.
   */
  constructor(
    private userRepository: IUserRepository,
  ) {}

  /**
   * Executes the create user use case.
   *
   * @async
   * @param {ICreateUserRequestDTO} request - The user creation request data.
   * @returns {Promise<ResponseDTO>} The response data.
   */
  async execute({
    email,
    name,
    password,
  }: ICreateUserRequestDTO): Promise<ResponseDTO> {
    try {
      const userEntity = UserEntity.create({
        email,
        name,
        password,
      })

      const userAlreadyExists = await this.userRepository.findByEmail(
        userEntity.email,
      )

      if (userAlreadyExists) {
        return {
          data: { error: UserErrorType.UserAlreadyExists },
          success: false,
        }
      }

      const user = await this.userRepository.create({
        email: userEntity.email,
        name: userEntity.name,
        password: password,
      })

      return { data: user, success: true }
    } catch (error: any) {
      return { data: { error: error.message }, success: false }
    }
  }
}