import { IHttpResponse } from 'presentation/http/helpers/IHttpResponse'
import { IHttpSuccess } from 'presentation/http/helpers/IHttpSuccess'

/**
 * Implementation of IHttpSuccess representing HTTP success responses.
 */
export class HttpSuccess implements IHttpSuccess {
  /**
   * Creates a success response with status code 200.
   * @param data - The data to be included in the response body.
   * @returns An HTTP response with status code 200 and the provided data.
   */
  success_200(data?: any): IHttpResponse {
    return {
      statusCode: 200,
      body: data,
    }
  }

  /**
   * Creates a success response with status code 201.
   * @param data - The data to be included in the response body.
   * @returns An HTTP response with status code 201 and the provided data.
   */
  success_201(data?: any): IHttpResponse {
    return {
      statusCode: 201,
      body: data,
    }
  }

  /**
   * Creates a success response with status code 202.
   * @param data - The data to be included in the response body.
   * @returns An HTTP response with status code 202 and the provided data.
   */
  success_202(data?: any): IHttpResponse {
    return {
      statusCode: 202,
      body: data,
    }
  }
}