import { HttpResponse } from 'presentation/http/helpers/implementations/HttpResponse'
import { HttpSuccess } from 'presentation/http/helpers/implementations/HttpSuccess'
import { IHttpResponse } from 'presentation/http/helpers/IHttpResponse'
import { IController } from '../IController'
import { QueueFileUseCase } from 'app/useCases/files/implementations/queueFile'
import { logger } from 'infra/logger/logger'

export class UploadXlsxController implements IController {
  constructor(private useCase: QueueFileUseCase) {}

  async handle(httpRequest: any): Promise<IHttpResponse> {
    const file = httpRequest.file
    if (!file) {
      return new HttpResponse(400, { error: 'No file uploaded' })
    }

     const taskId = await this.useCase.execute(file.path)

    const success = new HttpSuccess().success_202({ taskId })
    return new HttpResponse(success.statusCode, success.body)
  }
}
