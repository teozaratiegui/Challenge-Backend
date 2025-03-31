import { IGetUsersUseCase } from 'app/useCases/user/getUsers'
import { ResponseDTO } from 'domain/dtos/Response'
import { IHttpErrors } from 'presentation/http/helpers/IHttpErrors'
import { IHttpRequest } from 'presentation/http/helpers/IHttpRequest'
import { IHttpResponse } from 'presentation/http/helpers/IHttpResponse'
import { IHttpSuccess } from 'presentation/http/helpers/IHttpSuccess'
import { HttpErrors } from 'presentation/http/helpers/implementations/HttpErrors'
import { HttpResponse } from 'presentation/http/helpers/implementations/HttpResponse'
import { HttpSuccess } from 'presentation/http/helpers/implementations/HttpSuccess'
import { IController } from 'presentation/http/controllers/IController'
import { logger } from 'infra/logger/logger'

/**
 * Controller for handling requests to get all users.
 */
export class GetUsersController implements IController {
  constructor(
    private getUsersCase: IGetUsersUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(_: IHttpRequest): Promise<IHttpResponse> {
    try {
      const response: ResponseDTO = await this.getUsersCase.execute()

      if (!response.success) {
        const error = this.httpErrors.error_400()
        return new HttpResponse(error.statusCode, response.data)
      }

      const success = this.httpSuccess.success_200(response.data)
      return new HttpResponse(success.statusCode, success.body)
    } catch (err: any) {
      logger.error('Error in GetUsersController:', err.message)
      const error = this.httpErrors.error_500()
      return new HttpResponse(error.statusCode, error.body)
    }
  }
}
