import { FileDataRepository } from 'infra/repositories/mongodb/fileDataRepository'
import { FileDataUseCase } from 'app/useCases/files/implementations/fileData'
import { GetFileDataPageController } from 'presentation/http/controllers/files/fileData'
import { IController } from 'presentation/http/controllers/IController'
import FileRepository from 'infra/repositories/mongodb/fileRepository'

export function getFileDataPage(): IController {
  const repo = new FileDataRepository()
  const fileRepo = new FileRepository()
  const useCase = new FileDataUseCase(fileRepo, repo)
  return new GetFileDataPageController(useCase)
}