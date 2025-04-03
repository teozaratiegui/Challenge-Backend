import { IController } from 'presentation/http/controllers/IController'
import { IHttpRequest } from 'presentation/http/helpers/IHttpRequest'
import { IHttpResponse } from 'presentation/http/helpers/IHttpResponse'
import { HttpResponse } from 'presentation/http/helpers/implementations/HttpResponse'
import { HttpSuccess } from 'presentation/http/helpers/implementations/HttpSuccess'
import { GetFileStatusUseCase } from 'app/useCases/files/implementations/fileStatus'
import { FileErrors } from 'domain/enums/files/fileErrors'
import { DomainError } from 'domain/entities/domainError'
import { logger } from 'infra/logger/logger'

export class GetFileStatusController implements IController {
  constructor(private useCase: GetFileStatusUseCase) {}

  async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const pathParams = httpRequest.path as { id?: string }
    const queryParams = httpRequest.query as { page?: string }
    const fileId = pathParams?.id
    const page = queryParams?.page ? parseInt(queryParams.page) : 1

    if (!fileId) throw new DomainError(FileErrors.MISSING_FILE_ID, 'Missing file id parameter')

    logger.info(`Getting status for file ${fileId} and page ${page}`)
    const result = await this.useCase.execute(fileId, page)
    const success = new HttpSuccess().success_200(result)
    return new HttpResponse(success.statusCode, success.body)
  }
}