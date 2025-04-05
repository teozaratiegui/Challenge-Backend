import mongoose from 'mongoose'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'
import { IFileErrorsRepository } from 'app/repositories/iFileErrorsRepository'
import { logger } from 'infra/logger/logger'

const ErrorRecordSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: true },
    row: Number,
    col: Number
  },
  { timestamps: true }
)

const ErrorRecordModel = mongoose.model('ErrorRecord', ErrorRecordSchema)

export class FileErrorsRepository implements IFileErrorsRepository {
  async bulkInsert(uuid: string, fileErrors: { row: number; col: number }[]): Promise<void> {
    try {
      const records = fileErrors.map(error => ({ ...error, uuid }))
      await ErrorRecordModel.insertMany(records)
    } catch (err) {
      logger.error(err)
      throw new DomainError(FileErrors.DATABASE_ERROR, 'Error bulk inserting error records')
    }
  }

  async findByUuidWithPagination(uuid: string, limit: number, offset: number): Promise<{ fileErrors: any[]; total: number; hasNext: boolean }> {
    try {
      const fileErrors = await ErrorRecordModel.find({ uuid })
        .skip(offset)
        .limit(limit)
        .select('row col -_id')
        .lean()

      const total = await ErrorRecordModel.countDocuments({ uuid })
      const hasNext = offset + limit < total

      return { fileErrors: fileErrors, total, hasNext }
    } catch (err) {
      logger.error(err)
      throw new DomainError(FileErrors.DATABASE_ERROR, 'Error fetching error records')
    }
  }

  async deleteMany(): Promise<void> {
    try {
      await ErrorRecordModel.deleteMany({})
    } catch (err) {
      logger.error(err)
      throw new DomainError(FileErrors.DATABASE_ERROR, 'Error deleting valid records')
    }
  }
}

export default FileErrorsRepository 