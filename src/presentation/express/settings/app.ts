import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { ErrorRequestHandler } from 'express'

import { userRoutes } from 'presentation/express/routers/user'

import { logRequest } from 'presentation/express/middlewares/loggerMiddleware'
import { uploadRoutes } from '../routers/file'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'
import { mapDomainErrorToHttp } from 'presentation/http/helpers/errorMapper'
import { logger } from 'infra/logger/logger'

/**
 * Express application instance.
 */
const app = express()

/**
 * CORS options for allowing all origins.
 */
const corsOptions: cors.CorsOptions = {
  origin: '*',
}
app.use(logRequest)
app.use(cors(corsOptions))
app.use(express.json())
app.use(cors());
app.use(helmet());

/**
 * Mounting routes for documentation, user-related, and authentication endpoints.
 */
app.use('/users', userRoutes)
app.use('/files', uploadRoutes)

const errorHandler: ErrorRequestHandler = (err, req, res, _next): void => {
  if (err instanceof DomainError) {
    const mapped = mapDomainErrorToHttp(err)
    res.status(mapped.statusCode).json(mapped.body)
    return
  }

  logger.error('Unhandled error in middleware', err)

  res.status(500).json({
    error: 'Unexpected server error'
  })
}

app.use(errorHandler)

export { app }