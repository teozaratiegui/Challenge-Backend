import { IFileRepository } from 'app/repositories/iFileRepository'
import { IFilePublisher } from 'app/protocols/filePublisher'
import { FileStatus } from 'domain/enums/files/fileStatus'

export class QueueFileUseCase {
  constructor(
    private repository: IFileRepository,
    private publisher: IFilePublisher
  ) {}

  async execute(filePath: string): Promise<string> {
    
    const file = await this.repository.create({
      filePath,
      status: FileStatus.PENDING,
    })

    await this.publisher.send('xlsx.upload', {
      taskId: file._id,
      path: filePath,
    })

    return file._id
  }
}
