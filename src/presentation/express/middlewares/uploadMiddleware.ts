import multer from 'multer'
import path from 'path'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'
import { logger } from 'infra/logger/logger'

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${Date.now()}-${file.originalname}`
    cb(null, filename)
  }
})

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new DomainError(
        FileErrors.INVALID_FILE_FORMAT,
        'Only .xlsx files are allowed'
      )
    )
  }

  cb(null, true)
}

export const upload = multer({ storage, fileFilter })

export function handleMulterError(middleware: any) {
  return (req: any, res: any, next: any) => {
    middleware(req, res, (err: any) => {
      if (!req.file && !err) {
        return next(
          new DomainError(
            FileErrors.NO_FILE_UPLOADED,
            'Missing file in "file" key in form-data'
          )
        )
      }

      // ✅ Nueva validación de archivo vacío
      if (req.file && req.file.size === 0) {
        return next(
          new DomainError(
            FileErrors.INVALID_FILE_FORMAT,
            'Uploaded file is empty'
          )
        )
      }

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(
            new DomainError(
              FileErrors.NO_FILE_UPLOADED,
              'Missing "file" field in form-data'
            )
          )
        }

        return next(err)
      }

      if (err instanceof DomainError) {
        return next(err)
      }

      next(err)
    })
  }
}
