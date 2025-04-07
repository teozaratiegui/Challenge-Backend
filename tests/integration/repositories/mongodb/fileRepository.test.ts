import { describe, it, expect } from 'vitest'
import { FileRepository } from 'infra/repositories/mongodb/fileRepository'
import mongoose from 'mongoose'
import { logger } from 'infra/logger/logger'

const repository = new FileRepository()
const MONGO_URI = process.env.MONGO_TEST_URI || 'mongodb://mongo:27017/test' 

beforeAll(async () => {
  await mongoose.connect(MONGO_URI, {
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