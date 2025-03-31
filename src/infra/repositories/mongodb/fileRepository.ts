// --- Repository: MongooseUploadTaskRepository.ts ---
import mongoose from 'mongoose'
import { IFileRepository } from 'app/repositories/iFileRepository'
import { FileStatus } from 'domain/enums/files/fileStatus'

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
    const task = new UploadTaskModel({
      filePath: data.filePath,
      status: data.status,
    })

    const newTask = await task.save()
    return { _id: newTask._id.toString() }
  }
}

export default FileRepository
