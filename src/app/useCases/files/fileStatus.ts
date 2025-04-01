/**
 * Interface for the use case of getting a file status.
 *
 * @interface
 */
export interface IFileStatusUseCase {
    /**
     * Executes the file status use case.
     *
     * @async
     * @param {filePath} data - The id of the file.
     * @returns {Promise<void>} The response data.
     */
    execute(data: string): Promise<string>
  }