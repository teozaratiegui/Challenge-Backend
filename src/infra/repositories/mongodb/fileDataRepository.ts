import mongoose from 'mongoose'
import { IFileDataRepository } from 'app/repositories/iFileDataRepository'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'
import { logger } from 'infra/logger/logger'

const ValidRecordSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: true },
    name: String,
    age: Number,
    nums: [Number]
  },
  { timestamps: true }
)

const ValidRecordModel = mongoose.model('ValidRecord', ValidRecordSchema)

export class FileDataRepository implements IFileDataRepository {
  async bulkInsert(records: { uuid: string; name: string; age: number; nums: number[] }[]): Promise<void> {
    try {
      await ValidRecordModel.insertMany(records)
    } catch (err) {
      logger.error(err)
      throw new DomainError(FileErrors.DATABASE_ERROR, 'Error bulk inserting valid records')
    }
  }

  async findByUuidWithPagination(uuid: string, limit: number, offset: number): Promise<{ data: any[]; total: number ; hasNext: boolean }> {
    try {
      const data = await ValidRecordModel.find({ uuid })
        .skip(offset)
        .limit(limit)
        .select('name age nums -_id')
        .lean()

      const total = await ValidRecordModel.countDocuments({ uuid })
      const hasNext = offset + limit < total

      return { data, total, hasNext }
    } catch (err) {
      logger.error(err)
      throw new DomainError(FileErrors.DATABASE_ERROR, 'Error fetching valid records')
    }
  }
}

export default FileDataRepository 