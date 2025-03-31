export interface IFilePublisher {
    send(queue: string, message: any): Promise<void>
}
  