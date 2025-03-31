export interface IFilePublisher {
    send(queue: string, message: { taskId: string; path: string }): Promise<void>
  }
  