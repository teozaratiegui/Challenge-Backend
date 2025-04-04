import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { ErrorRequestHandler } from 'express'
import { logRequest } from 'presentation/express/middlewares/loggerMiddleware'
import { uploadRoutes } from '../routers/file'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'
import { mapDomainErrorToHttp } from 'presentation/http/helpers/errorMapper'
import { logger } from 'infra/logger/logger'


const app = express()

const corsOptions: cors.CorsOptions = {
  origin: '*',
}
app.use(logRequest)
app.use(cors(corsOptions))
app.use(express.json())
app.use(cors());
app.use(helmet());

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