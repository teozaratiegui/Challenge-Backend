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
 * @swagger
 * /files:
 *   post:
 *     summary: Upload and enqueue an xlsx file
 *     tags: [Files]
 *     security:
 *       - ApiKeyUpload: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       202:
 *         description: File uploaded successfully and task queued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId:
 *                   type: string
 *                   description: UUID of the queued processing task
 *       400:
 *         description: No file uploaded
 *       403:
 *         description: Unauthorized - invalid or missing API key
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Server error
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
)/**
 * @swagger
 * /files/{id}:
 *   get:
 *     summary: Get the status of an uploaded file
 *     tags: [Files]
 *     security:
 *       - ApiKeyStatus: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *       - name: limit
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of errors to return (max 100)
 *       - name: offset
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of error records to skip
 *     responses:
 *       200:
 *         description: File status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: done
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       row:
 *                         type: integer
 *                       col:
 *                         type: integer
 *                 total:
 *                   type: integer
 *                 hasNext:
 *                   type: boolean
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Server error
 */




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

/**
 * @swagger
 * /files/{uuid}/data:
 *   get:
 *     summary: Get processed data for a specific file
 *     tags: [Files]
 *     security:
 *       - ApiKeyData: []
 *     parameters:
 *       - name: uuid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: File UUID
 *       - name: limit
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of records to return (max 100)
 *       - name: offset
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: File data retrieved
 *       400:
 *         description: Invalid request or limit exceeded
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Server error
 */
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
