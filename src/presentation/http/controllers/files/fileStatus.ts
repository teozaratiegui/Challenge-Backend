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
    const queryParams = httpRequest.query as { limit?: string; offset?: string }
    const fileId = pathParams?.id

    if (!fileId || queryParams.limit === undefined || queryParams.offset === undefined) {
      throw new DomainError(FileErrors.MISSING_FILE_ID, 'Missing file id, limit or offset parameter')
    }

    const limit = parseInt(queryParams.limit)
    const offset = parseInt(queryParams.offset)

    if (isNaN(limit) || isNaN(offset)) {
      throw new DomainError(FileErrors.INVALID_PAGE, 'Limit and offset must be numbers')
    }

    if (limit > 100) {
      throw new DomainError(FileErrors.INVALID_PAGE, 'You cannot request more than 100 records')
    }

    logger.info(`Getting status for file ${fileId} with limit ${limit} and offset ${offset}`)
    const result = await this.useCase.execute(fileId, limit, offset)
    const success = new HttpSuccess().success_200(result)
    return new HttpResponse(success.statusCode, success.body)
  }
}