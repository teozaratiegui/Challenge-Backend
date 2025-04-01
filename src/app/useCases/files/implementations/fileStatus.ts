import { IFileRepository } from 'app/repositories/iFileRepository'
import { IFileStatusUseCase } from 'app/useCases/files/fileStatus'

export class GetFileStatusUseCase implements IFileStatusUseCase {
  constructor(private repository: IFileRepository) {}

  async execute(taskId: string): Promise<string> {
    const task = await this.repository.findById(taskId)
    if (!task) {
      throw new Error('Task not found')
    }
    return task.status
  }
}