import { IFileDataRepository } from 'app/repositories/iFileDataRepository'
import { IFileRepository } from 'app/repositories/iFileRepository'
import { IFileDataUseCase } from 'app/useCases/files/fileData'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'

export class FileDataUseCase implements IFileDataUseCase {
  constructor(
    private fileRepository: IFileRepository,
    private repository: IFileDataRepository
  ) {}

  async execute(uuid: string, limit: number, offset: number): Promise<any> {
    if (!uuid) throw new DomainError(FileErrors.MISSING_FILE_ID, 'Missing UUID')
    if (limit > 100) throw new DomainError(FileErrors.INVALID_PAGE, 'You cannot request more than 100 records.')

    const file = await this.fileRepository.findById(uuid)
    if (!file) throw new DomainError(FileErrors.FILE_NOT_FOUND, 'File not found')

    if (file.status !== 'done') {
      return {
        message: file.status === 'pending'
          ? 'File is yet to be processed'
          : 'File is still being processed'
      }
    }

    const { data, total, hasNext } = await this.repository.findByUuidWithPagination(uuid, limit, offset)

    if (data.length === 0) {
      return { message: 'No records found for the given limit and offset range.' }
    }

    return { total, hasNext, data }
  }
}
