import { IController } from 'presentation/http/controllers/IController'
import { IHttpRequest } from 'presentation/http/helpers/IHttpRequest'
import { IHttpResponse } from 'presentation/http/helpers/IHttpResponse'
import { HttpResponse } from 'presentation/http/helpers/implementations/HttpResponse'
import { HttpSuccess } from 'presentation/http/helpers/implementations/HttpSuccess'
import { GetFileStatusUseCase } from 'app/useCases/files/implementations/fileStatus'

export class GetFileStatusController implements IController {
  constructor(private useCase: GetFileStatusUseCase) {}

  async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const pathParams = httpRequest.path as { id?: string }
    const taskId = pathParams?.id

    if (!taskId) {
      return new HttpResponse(400, { error: 'Missing taskId parameter' })
    }

    const status = await this.useCase.execute(taskId)
    const success = new HttpSuccess().success_200({ status })
    return new HttpResponse(success.statusCode, success.body)
  }
}