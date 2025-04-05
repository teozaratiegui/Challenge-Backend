import { describe, it, expect } from 'vitest'
import { FileRepository } from 'infra/repositories/mongodb/fileRepository'
import mongoose from 'mongoose'
import { logger } from 'infra/logger/logger'

const repository = new FileRepository()

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as any)
})

beforeEach(async () => {
  await repository.deleteMany()
})

afterAll(async () => {
  await mongoose.disconnect()
})

describe('FileRepository Integration', () => {
  


  it('should create and find a file', async () => {
    const file = await repository.create({ filePath: 'some/path', status: 'pending' })
    const found = await repository.findById(file.uuid)
    expect(found?.uuid).toBe(file.uuid)
  })
})