import { IController } from 'presentation/http/controllers/IController'
import { IHttpRequest } from 'presentation/http/helpers/IHttpRequest'
import { IHttpResponse } from 'presentation/http/helpers/IHttpResponse'
import { HttpResponse } from 'presentation/http/helpers/implementations/HttpResponse'
import { HttpSuccess } from 'presentation/http/helpers/implementations/HttpSuccess'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'
import { FileDataUseCase } from 'app/useCases/files/implementations/fileData'

export class GetFileDataPageController implements IController {
  constructor(private useCase: FileDataUseCase) {}

  async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { uuid } = httpRequest.path as { uuid?: string }
    const { limit, offset } = httpRequest.query as { limit?: string; offset?: string }

    if (!uuid || limit === undefined || offset === undefined) {
      throw new DomainError(FileErrors.MISSING_FILE_ID, 'Missing uuid, limit or offset param')
    }

    const limitValue = parseInt(limit)
    const offsetValue = parseInt(offset)

    if (isNaN(limitValue) || isNaN(offsetValue)) {
      throw new DomainError(FileErrors.INVALID_PAGE, 'Limit and offset must be numbers')
    }

    if (limitValue > 100) {
      throw new DomainError(FileErrors.INVALID_PAGE, 'You cannot request more than 100 records')
    }

    const result = await this.useCase.execute(uuid, limitValue, offsetValue)
    const success = new HttpSuccess().success_200(result)
    return new HttpResponse(success.statusCode, success.body)
  }
}