export interface IFilePublisher {
    send(queue: string, message: { uuid: string; path: string }): Promise<void>
  }
  