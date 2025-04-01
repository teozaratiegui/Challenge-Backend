import mongoose from 'mongoose'
import { IFileRepository } from 'app/repositories/iFileRepository'
import { FileStatus } from 'domain/enums/files/fileStatus'
import { DomainError } from 'domain/entities/domainError'
import { FileErrors } from 'domain/enums/files/fileErrors'

const UploadTaskSchema = new mongoose.Schema(
  {
    filePath: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(FileStatus),
      default: 'pending',
    },
  },
  { timestamps: true }
)

const UploadTaskModel = mongoose.model('UploadTask', UploadTaskSchema)

export class FileRepository implements IFileRepository {
  async create(data: { filePath: string; status: string }): Promise<{ _id: string }> {
    try {
      const file = new UploadTaskModel({
        filePath: data.filePath,
        status: data.status,
      })
  
      const newFile = await file.save()
      return { _id: newFile._id.toString() }
    } catch (err) {
      throw new DomainError(
        FileErrors.DATABASE_ERROR,
        'Error uploading file'
      )
    }
  }

  async findById(fileId: string): Promise<{ status: string } | null> {
    try {
      const isValid = mongoose.Types.ObjectId.isValid(fileId)
      if (!isValid) throw new DomainError(FileErrors.FILE_NOT_FOUND, 'Invalid file ID')
  
      const file = await UploadTaskModel.findById(fileId).exec()
      if (!file) throw new DomainError(FileErrors.FILE_NOT_FOUND, 'File not found')
  
      return { status: file.status }
    } catch (err) {
      if (err instanceof DomainError) throw err

      throw new DomainError(
        FileErrors.DATABASE_ERROR,
        'Error finding file by ID'
      )
    } 
  }
}

export default FileRepository
