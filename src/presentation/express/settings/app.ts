import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { userRoutes } from 'presentation/express/routers/user'

import { logRequest } from 'presentation/express/middlewares/loggerMiddleware'
import { uploadRoutes } from '../routers/file'

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

export { app }