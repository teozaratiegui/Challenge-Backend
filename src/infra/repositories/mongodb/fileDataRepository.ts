import mongoose from 'mongoose'
import { IFileDataRepository } from 'app/repositories/iFileDataRepository'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'
import { logger } from 'infra/logger/logger'

const ValidRecordSchema = new mongoose.Schema(
    {
      uuid: { type: String, required: true },
      page: { type: Number, required: true },
      data: [
        {
          _id: false,
          name: String,
          age: Number,
          nums: [Number]
        }
      ]
    },
    { timestamps: true }
)

const ValidRecordModel = mongoose.model('ValidRecord', ValidRecordSchema)

export class ValidRecordRepository implements IFileDataRepository {

    async savePage(uuid: string, page: number, data: any[]): Promise<void> {
        try {
            const document = new ValidRecordModel({ uuid, page, data })
            await document.save()
        } catch (err) {
            throw new DomainError(
                FileErrors.DATABASE_ERROR,
                'Error uploading file'
            )
        }
    }

    async findPage(uuid: string, page: number): Promise<{ data: any[] } | null> {
      const doc = await ValidRecordModel.findOne({ uuid, page }).exec()
      return doc ? { data: doc.data } : null
    }

    async bulkInsertPages(pages: { uuid: string, page: number, data: any[] }[]): Promise<void> {
      try {
        await ValidRecordModel.insertMany(pages)
      } catch (err) {
        logger.error(err)
        throw new DomainError(
          FileErrors.DATABASE_ERROR,
          'Error bulk inserting pages'
        )
      }
    }

}

export default ValidRecordRepository

