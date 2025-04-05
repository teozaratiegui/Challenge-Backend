import { IFileRepository } from 'app/repositories/iFileRepository'
import { IFileErrorsRepository } from 'app/repositories/iFileErrorsRepository'
import { IFileStatusUseCase } from 'app/useCases/files/fileStatus'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'

export class GetFileStatusUseCase implements IFileStatusUseCase {
  constructor(
    private fileRepo: IFileRepository,
    private errorRepo: IFileErrorsRepository
  ) {}

  async execute(uuid: string, limit: number, offset: number): Promise<any> {
    if (limit > 100) {
      throw new DomainError(FileErrors.INVALID_PAGE, 'You cannot request more than 100 records.')
    }

    if (offset < 0) {
      throw new DomainError(FileErrors.INVALID_PAGE, 'Offset must be greater than or equal to 0.')
    }

    const file = await this.fileRepo.findById(uuid)
    if (!file) {
      throw new DomainError(FileErrors.FILE_NOT_FOUND, 'File not found')
    }

    if (file.status === 'done') {
      const { fileErrors: errors, total, hasNext } = await this.errorRepo.findByUuidWithPagination(uuid, limit, offset)

      if (errors.length === 0) {
        return {
          status: file.status,
          message: 'No error records found for the given limit and offset range.'
        }
      }

      return {
        status: file.status,
        hasNext,
        total,
        limit,
        offset,
        errors
      }
    }

    return { status: file.status }
  }
}
