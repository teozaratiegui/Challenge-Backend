import mongoose from 'mongoose'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'
import { IFileErrorsRepository } from 'app/repositories/iFileErrorsRepository'
import { logger } from 'infra/logger/logger'

const ErrorRecordSchema = new mongoose.Schema(
    {
      uuid: { type: String, required: true },
      page: { type: Number, required: true },
      fileErrors: [
        {
          _id: false,
          row: Number,
          col: Number
        }
      ]
    },
    { timestamps: true }
)

const ErrorRecordModel = mongoose.model('ErrorRecord', ErrorRecordSchema)

export class ErrorRecordRepository implements IFileErrorsRepository {
    async savePage(uuid: string, page: number, fileErrors: any[]): Promise<void> {
        try {
          const document = new ErrorRecordModel({ uuid, page, fileErrors })
          await document.save()
        } catch (err) {
            throw new DomainError(
              FileErrors.DATABASE_ERROR,
              'Error uploading file'
            )
        }
    }

    async bulkInsertPages(pages: { uuid: string, page: number, fileErrors: any[] }[]): Promise<void> {
      try {
        await ErrorRecordModel.insertMany(pages)
      } catch (err) {
        throw new DomainError(FileErrors.DATABASE_ERROR, 'Error bulk inserting error pages')
      }
    }
  
    async findPage(uuid: string, page: number): Promise<{ fileErrors: any[] } | null> {
      try {
        const doc = await ErrorRecordModel.findOne({ uuid, page }).lean()
        return doc ? { fileErrors: doc.fileErrors } : null
      } catch (err) {
        throw new DomainError(FileErrors.DATABASE_ERROR, 'Error finding error page')
      }
    }

}

export default ErrorRecordRepository
  