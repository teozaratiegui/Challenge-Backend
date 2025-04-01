import { Request, Response, NextFunction } from 'express'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'

/**
 * Factory to create a middleware that validates a specific API key based on .env variable name
 * @param envKeyName The name of the environment variable to compare against
 */
export function ensureAuthenticated(envKeyName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const apiKey = req.headers['api-key'] as string | undefined

    if (!apiKey) {
      throw new DomainError(FileErrors.NO_API_KEY, 'API key missing')
    }

    const validApiKey = process.env[envKeyName]

    if (!validApiKey) {
      throw new DomainError(FileErrors.SERVER_MISCONFIG, `Missing env variable: ${envKeyName}`)
    }

    if (apiKey !== validApiKey) {
      throw new DomainError(FileErrors.INVALID_API_KEY, 'Invalid API key')
    }

    next()
  }
}
