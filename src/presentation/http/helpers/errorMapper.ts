import { DomainError } from "domain/entities/domainError";
import { FileErrors } from "domain/enums/files/fileErrors";

export function mapDomainErrorToHttp(error: unknown): { statusCode: number; body: any } {
  if (error instanceof DomainError) {
    switch (error.code) {

        case FileErrors.MISSING_FILE_ID:
        case FileErrors.INVALID_FILE_FORMAT:
        case FileErrors.NO_FILE_UPLOADED:
            return { statusCode: 400, body: { error: error.message } }
            
        case FileErrors.NO_API_KEY:
        case FileErrors.INVALID_API_KEY:
            return { statusCode: 403, body: { error: error.message } }

        case FileErrors.FILE_NOT_FOUND:
            return { statusCode: 404, body: { error: error.message } }

        case FileErrors.DATABASE_ERROR:
        case FileErrors.RABBITMQ_ERROR:
        case FileErrors.SERVER_MISCONFIG:
        default:
            return { statusCode: 500, body: { error: error.message } }
    }
  }

  return { statusCode: 500, body: { error: 'Unexpected server error' } }
}