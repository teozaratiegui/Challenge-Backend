import { Request } from 'express'
import { IController } from 'presentation/http/controllers/IController'
import { IHttpRequest } from 'presentation/http/helpers/IHttpRequest'
import { IHttpResponse } from 'presentation/http/helpers/IHttpResponse'
import { HttpRequest } from 'presentation/http/helpers/implementations/HttpRequest'
import { logger } from 'infra/logger/logger'
import { mapDomainErrorToHttp } from 'presentation/http/helpers/errorMapper'

/**
 * Adapts Express request to the application's request format and calls the provided controller.
 *
 * @async
 * @param {Request} request - The Express request object.
 * @param {IController} apiRoute - The controller to handle the request.
 * @returns {Promise<IHttpResponse>} The response from the controller.
 */
export async function expressAdapter(
  request: Request,
  apiRoute: IController,
): Promise<IHttpResponse> {
  const httpRequest: IHttpRequest = new HttpRequest({
    header: request.header,
    body: request.body,
    path: request.params,
    query: request.query,
    file: request.file,
  })
  
  return await apiRoute.handle(httpRequest)
}