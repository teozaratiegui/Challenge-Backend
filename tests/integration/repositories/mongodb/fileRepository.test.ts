import { describe, it, expect } from 'vitest'
import { FileRepository } from 'infra/repositories/mongodb/fileRepository'
import mongoose from 'mongoose'
import { logger } from 'infra/logger/logger'

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as any)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

describe('FileRepository Integration', () => {
  const repository = new FileRepository()


  it('should create and find a file', async () => {
    const file = await repository.create({ filePath: 'some/path', status: 'pending' })
    const found = await repository.findById(file.uuid)
    expect(found?.uuid).toBe(file.uuid)
  })
})