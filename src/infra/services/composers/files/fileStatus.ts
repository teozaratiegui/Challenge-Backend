import { FileRepository } from 'infra/repositories/mongodb/fileRepository'
import { GetFileStatusUseCase } from 'app/useCases/files/implementations/fileStatus'
import { GetFileStatusController } from 'presentation/http/controllers/files/fileStatus'
import { IController } from 'presentation/http/controllers/IController'
import { FileErrorsRepository } from 'infra/repositories/mongodb/fileErrorsRepository'

export function getFileStatus(): IController {
  const repository = new FileRepository()
  const fileErrorsRepository = new FileErrorsRepository()
  const useCase = new GetFileStatusUseCase(repository, fileErrorsRepository)
  return new GetFileStatusController(useCase)
}