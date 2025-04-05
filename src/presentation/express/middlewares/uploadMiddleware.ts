import multer from 'multer'
import path from 'path'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'
import { logger } from 'infra/logger/logger'
import ExcelJS from 'exceljs'
import fs from 'fs/promises' // importante: usamos fs.promises


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
  return async (req: any, res: any, next: any) => {
    middleware(req, res, async (err: any) => {
      if (!req.file && !err) {
        return next(
          new DomainError(
            FileErrors.NO_FILE_UPLOADED,
            'Missing file in "file" key in form-data'
          )
        )
      }

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

      // ✅ Validar headers del archivo Excel
      if (req.file) {
        try {
          const workbook = new ExcelJS.Workbook()
          await workbook.xlsx.readFile(req.file.path)
          const headerRow = workbook.worksheets[0].getRow(1)

          if (!Array.isArray(headerRow.values)) {
            await fs.unlink(req.file.path)
            return next(
              new DomainError(
                FileErrors.INVALID_FILE_FORMAT,
                'Header is not in the expected format'
              )
            )
          }

          const actualHeaders = headerRow.values.slice(1, 4).map(cell => cell?.toString().toLowerCase())
          const expectedHeaders = ['name', 'age', 'nums']
          const headersValid = expectedHeaders.every((header, index) => actualHeaders[index] === header)

          if (!headersValid) {
            await fs.unlink(req.file.path)
            return next(
              new DomainError(
                FileErrors.INVALID_FILE_FORMAT,
                'The file does not contain the required headers: name, age, nums'
              )
            )
          }
        } catch (e) {
          await fs.unlink(req.file.path)
          return next(
            new DomainError(
              FileErrors.INVALID_FILE_FORMAT,
              'Could not parse uploaded file'
            )
          )
        }
      }

      next()
    })
  }
}
