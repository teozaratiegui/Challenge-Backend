import { Request, Response, Router } from 'express'
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated'
import { upload, handleMulterError } from 'presentation/express/middlewares/uploadMiddleware'
import { expressAdapter } from 'presentation/adapters/expressAdapter'
import { queueFile } from 'infra/services/composers/files/queueFile'
import { logger } from 'infra/logger/logger'
import { getFileStatus } from 'infra/services/composers/files/fileStatus'
import { getFileDataPage } from 'infra/services/composers/files/fileData'

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

  uploadRoutes.get(
    '/:uuid/data',
    ensureAuthenticated('API_KEY_DATA'),
    async (request: Request, response: Response, next): Promise<any> => {
      expressAdapter(request, getFileDataPage())
        .then(adapter => response.status(adapter.statusCode).json(adapter.body))
        .catch(next)
    }
  )

  uploadRoutes.all('/', (req, res) => {
    res.status(405).json({ error: `Method ${req.method} not allowed on /` })
  })

  uploadRoutes.all('/:id', (req, res) => {
    res.status(405).json({ error: `Method ${req.method} not allowed on /:id` })
  })

  uploadRoutes.all('/:uuid/data', (req, res) => {
    res.status(405).json({ error: `Method ${req.method} not allowed on /:uuid/data` })
  })


export { uploadRoutes }
