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
    const { page } = httpRequest.query as { page?: string }

    if (!uuid || !page) {
      throw new DomainError(FileErrors.MISSING_FILE_ID, 'Missing uuid or page param')
    }

    const pageNumber = parseInt(page)
    const result = await this.useCase.execute(uuid, pageNumber)
    const success = new HttpSuccess().success_200(result)
    return new HttpResponse(success.statusCode, success.body)
  }
}