import { IFileDataRepository } from 'app/repositories/iFileDataRepository'
import { IFileRepository } from 'app/repositories/iFileRepository';
import { IFileDataUseCase } from 'app/useCases/files/fileData'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'

export class FileDataUseCase implements IFileDataUseCase {
  constructor(private fileRepository: IFileRepository,private repository: IFileDataRepository) {}

  async execute(uuid: string, page: number): Promise<{ data: any[]; next: boolean } | { message: string } | null> {
    if (!uuid) throw new DomainError(FileErrors.MISSING_FILE_ID, 'Missing UUID')
    if (page <= 0) throw new DomainError(FileErrors.INVALID_PAGE, 'Invalid page number')
    
    const file = await this.fileRepository.findById(uuid)
    if (!file) {
      throw new DomainError(FileErrors.FILE_NOT_FOUND, "File not found")
    }

    if (file.status === 'done') {
      const currentPage = await this.repository.findPage(uuid, page)
      if (!currentPage) throw new DomainError(FileErrors.FILE_NOT_FOUND, 'Page not found')
  
      const nextPage = await this.repository.findPage(uuid, page + 1)
      return {
        data: currentPage.data,
        next: !!nextPage
      }
    } else {
      if (file.status === 'pending') {
        return {
          message: 'File is yet to be processed',
        }
      } else {
        return {
          message: 'File is still being processed',
        }
      }

    }
    
  }
}
