import mongoose from 'mongoose'
import { IFileRepository } from 'app/repositories/iFileRepository'
import { FileStatus } from 'domain/enums/files/fileStatus'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'
import { v4 as uuidv4 } from 'uuid'
import { logger } from 'infra/logger/logger'

const FileSchema = new mongoose.Schema(
  {
    filePath: { type: String, required: true },
    uuid: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: Object.values(FileStatus),
      default: 'pending',
    },
  },
  { timestamps: true }
)

const FileModel = mongoose.model('File', FileSchema)

export class FileRepository implements IFileRepository {
  async create(data: { filePath: string; status: string }): Promise<{ uuid: string }> {
    try {
      const generatedUUID = uuidv4()
      const file = new FileModel({
        uuid: generatedUUID,
        filePath: data.filePath,
        status: data.status,
      })

      const newFile = await file.save()
      return { uuid: newFile.uuid }
    } catch (err) {
      throw new DomainError(
        FileErrors.DATABASE_ERROR,
        'Error uploading file'
      )
    }
  }

  async findById(uuid: string): Promise<{ status: string } | null> {
    logger.info(uuid)
    try {
      const file = await FileModel.findOne({ uuid }).exec()
      if (!file) throw new DomainError(FileErrors.FILE_NOT_FOUND, 'File not found')

      return { status: file.status }
    } catch (err) {
      if (err instanceof DomainError) throw err

      throw new DomainError(
        FileErrors.DATABASE_ERROR,
        'Error finding file by UUID'
      )
    }
  }

  async updateStatus(uuid: string, status: FileStatus): Promise<void> {
    try {
      const updated = await FileModel.findOneAndUpdate({ uuid }, { status }, { new: true })

      if (!updated) {
        throw new DomainError(FileErrors.FILE_NOT_FOUND, 'File not found')
      }
    } catch (err) {
      if (err instanceof DomainError) throw err
      throw new DomainError(FileErrors.DATABASE_ERROR, 'Error updating file status')
    }
  }

}

export default FileRepository
