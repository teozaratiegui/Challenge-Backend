import { Request, Response, NextFunction } from 'express'
import { logger } from 'infra/logger/logger'

export function logRequest(req: Request, res: Response, next: NextFunction) {
  logger.info(`[${req.method}] ${req.originalUrl} - ${new Date().toISOString()}`)
  next()
}
