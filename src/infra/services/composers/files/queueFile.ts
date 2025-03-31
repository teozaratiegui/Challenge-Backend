//import { RabbitMQPublisher } from 'infra/queue/RabbitMQPublisher'
import { RabbitMQPublisher } from 'infra/queue/RabbitMQPublisher' 
import { QueueFileUseCase } from 'app/useCases/files/implementations/queueFile'
import { UploadXlsxController } from 'presentation/http/controllers/files/queueFile'
import { IController } from 'presentation/http/controllers/IController'

export function queueFile(): IController {
  const publisher = new RabbitMQPublisher()
  const useCase = new QueueFileUseCase(publisher)
  return new UploadXlsxController(useCase)
}
