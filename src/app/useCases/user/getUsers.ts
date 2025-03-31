import { ResponseDTO } from '../../../domain/dtos/Response'

/**
 * Interface for the get users use case.
 */
export interface IGetUsersUseCase {
  execute(): Promise<ResponseDTO>
}
