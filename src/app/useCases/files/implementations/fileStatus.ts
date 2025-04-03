import { IFileRepository } from 'app/repositories/iFileRepository'
import { IFileErrorsRepository } from 'app/repositories/iFileErrorsRepository'
import { IFileStatusUseCase } from 'app/useCases/files/fileStatus'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'
import { logger } from 'infra/logger/logger'

export class GetFileStatusUseCase implements IFileStatusUseCase {
  constructor(
    private fileRepo: IFileRepository,
    private errorRepo: IFileErrorsRepository
  ) {}

  async execute(fileId: string, page: number): Promise<any> {
    if (page <= 0) throw new DomainError(FileErrors.INVALID_PAGE, 'Invalid page number')
    const file = await this.fileRepo.findById(fileId)
    if (!file) {
      throw new DomainError(FileErrors.FILE_NOT_FOUND, "File not found")
    }

    if (file.status === 'done') {
      const result = await this.errorRepo.findPage(fileId, page)
      const nextPage = await this.errorRepo.findPage(fileId, page + 1)
      logger.info(result)
      return {
        status: file.status,
        errors: result?.fileErrors || [],
        next:  !!nextPage,
      }
    }

    return { status: file.status }
  }
}
