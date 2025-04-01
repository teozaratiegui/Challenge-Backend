import { FileRepository } from 'infra/repositories/mongodb/fileRepository'
import { GetFileStatusUseCase } from 'app/useCases/files/implementations/fileStatus'
import { GetFileStatusController } from 'presentation/http/controllers/files/fileStatus'
import { IController } from 'presentation/http/controllers/IController'

export function getFileStatus(): IController {
  const repository = new FileRepository()
  const useCase = new GetFileStatusUseCase(repository)
  return new GetFileStatusController(useCase)
}