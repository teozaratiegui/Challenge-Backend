import { IFilePublisher } from 'app/protocols/filePublisher'
import { IQueueFileUseCase } from 'app/useCases/files/queueFile'

export class QueueFileUseCase implements IQueueFileUseCase{
  constructor(private publisher: IFilePublisher) {}

  async execute(filePath: string): Promise<void> {
    await this.publisher.send('xlsx.upload', { path: filePath })
  }
}
