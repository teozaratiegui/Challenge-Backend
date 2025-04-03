import { IFileDataRepository } from "app/repositories/iFileDataRepository";
import { IFileErrorsRepository } from "app/repositories/iFileErrorsRepository";
import { IFileRepository } from "app/repositories/iFileRepository";

/**
 * Interface for the use case of processing a file .
 *
 * @interface
 */
export interface IProcessFileUseCase {
    /**
     * Executes the file status use case.
     *
     * @async
     * @param {filePath} data - The id of the file.
     * @returns {Promise<void>} The response data.
     */
    execute(fileRepo: IFileRepository, validRepo: IFileDataRepository, errorsRepo: IFileErrorsRepository): Promise<string>
  }