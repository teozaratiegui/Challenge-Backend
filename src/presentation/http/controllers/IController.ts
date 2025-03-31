import { IHttpResponse } from 'presentation/http/helpers/IHttpResponse'
import { HttpRequest } from 'presentation/http/helpers/implementations/HttpRequest'

/**
 * Interface for controllers that handle HTTP requests.
 */
export interface IController {
  /**
   * Handles an HTTP request and returns an HTTP response.
   * @param httpRequest The HTTP request to handle.
   * @returns A promise that resolves to an HTTP response.
   */
  handle(httpRequest: HttpRequest): Promise<IHttpResponse>
}