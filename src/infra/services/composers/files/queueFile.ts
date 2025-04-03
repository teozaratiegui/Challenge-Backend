import { FileRepository } from 'infra/repositories/mongodb/fileRepository'
import { RabbitMQPublisher } from 'infra/queue/publisher/RabbitMQPublisher' 
import { QueueFileUseCase } from 'app/useCases/files/implementations/queueFile'
import { UploadXlsxController } from 'presentation/http/controllers/files/queueFile'
import { IController } from 'presentation/http/controllers/IController'

export function queueFile(): IController {
    const repository = new FileRepository
    const publisher = new RabbitMQPublisher()
    const useCase = new QueueFileUseCase(repository, publisher)
    return new UploadXlsxController(useCase)
}
