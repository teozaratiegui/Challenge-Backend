import { HttpResponse } from 'presentation/http/helpers/implementations/HttpResponse'
import { HttpSuccess } from 'presentation/http/helpers/implementations/HttpSuccess'
import { IHttpResponse } from 'presentation/http/helpers/IHttpResponse'
import { HttpErrors } from 'presentation/http/helpers/implementations/HttpErrors'
import { IController } from '../IController'
import { QueueFileUseCase } from 'app/useCases/files/implementations/queueFile'
import { logger } from 'infra/logger/logger'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'

export class UploadXlsxController implements IController {
  constructor(private useCase: QueueFileUseCase) {}

  async handle(httpRequest: any): Promise<IHttpResponse> {
    const file = httpRequest.file
    if (!file) throw new DomainError(FileErrors.NO_FILE_UPLOADED, 'No file uploaded')

    const taskId = await this.useCase.execute(file.path)

    const success = new HttpSuccess().success_202({ taskId })
    return new HttpResponse(success.statusCode, success.body)
  }
}
