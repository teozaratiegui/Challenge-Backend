import { Request, Response, Router } from 'express'
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated'
import { upload } from 'presentation/express/middlewares/uploadMiddleware'
import { expressAdapter } from 'presentation/adapters/expressAdapter'
import { queueFile } from 'infra/services/composers/files/queueFile'
import { logger } from 'infra/logger/logger'

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
  upload.single('file'),
  async (request: Request, response: Response): Promise<any> => {
    const adapter = await expressAdapter(request, queueFile())
    return response.status(adapter.statusCode).json(adapter.body)
  }
)

export { uploadRoutes }
