import { ResponseDTO } from 'domain/dtos/Response'
import { IUserRepository } from 'app/repositories/IUserRepository'
import { IGetUsersUseCase } from 'app/useCases/user/getUsers'

/**
 * Use case for retrieving all users.
 */
export class GetUsersUseCase implements IGetUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<ResponseDTO> {
    try {
      const users = await this.userRepository.findAll()

      return {
        data: users,
        success: true,
      }
    } catch (error: any) {
      return {
        data: { error: error.message },
        success: false,
      }
    }
  }
}
