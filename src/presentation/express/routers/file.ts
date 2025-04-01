import { Request, Response, Router } from 'express'
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated'
import { upload, handleMulterError } from 'presentation/express/middlewares/uploadMiddleware'
import { expressAdapter } from 'presentation/adapters/expressAdapter'
import { queueFile } from 'infra/services/composers/files/queueFile'
import { logger } from 'infra/logger/logger'
import { getFileStatus } from 'infra/services/composers/files/fileStatus'

/**
 * Router for handling file upload (xlsx) operations.
 */
const uploadRoutes = Router()

/**
 * Endpoint to upload and enqueue an xlsx file.
 */
uploadRoutes.post(
  '/',
  ensureAuthenticated('API_KEY_UPLOAD'),
  handleMulterError(upload.single('file')),
  async (request: Request, response: Response, next): Promise<any> => {
    expressAdapter(request, queueFile())
    .then(adapter => {
      response.status(adapter.statusCode).json(adapter.body)
    })
    .catch(next)
  }
)

uploadRoutes.get(
    '/:id',
    ensureAuthenticated('API_KEY_STATUS'),
    async (request: Request, response: Response, next): Promise<any> => {
      expressAdapter(request, getFileStatus())
      .then(adapter => {
        response.status(adapter.statusCode).json(adapter.body)
      })
      .catch(next)
    }
  )

export { uploadRoutes }
