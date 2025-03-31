/**
 * Interface for the use case of creating a new user.
 *
 * @interface
 */
export interface IQueueFileUseCase {
  /**
   * Executes the create user use case.
   *
   * @async
   * @param {filePath} data - The data for creating a new user.
   * @returns {Promise<void>} The response data.
   */
  execute(data: string): Promise<void>
}