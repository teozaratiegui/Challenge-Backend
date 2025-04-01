import { IFileRepository } from 'app/repositories/iFileRepository'
import { IFileStatusUseCase } from 'app/useCases/files/fileStatus'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'

export class GetFileStatusUseCase implements IFileStatusUseCase {
  constructor(private repository: IFileRepository) {}

  async execute(fileId: string): Promise<string> {
    const file = await this.repository.findById(fileId)
    if (!file) {
      throw new DomainError(FileErrors.FILE_NOT_FOUND, "File not found")
    }
    return file.status
  }
}