import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import mongoose from 'mongoose'
import { FileErrorsRepository } from 'infra/repositories/mongodb/fileErrorsRepository'

const errorRepo = new FileErrorsRepository()

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as any)
})

beforeEach(async () => {
  await errorRepo.deleteMany()
})

afterAll(async () => {
  await mongoose.disconnect()
})

describe('ErrorRecordRepository Integration', () => {
  it('should bulk insert and paginate error records', async () => {
    const uuid = 'uuid-error-bulk'
    const errors = [
      { row: 1, col: 1 },
      { row: 2, col: 2 },
      { row: 3, col: 3 }
    ]

    await errorRepo.bulkInsert(uuid, errors)

    const { fileErrors: data, total, hasNext } = await errorRepo.findByUuidWithPagination(uuid, 2, 0)

    expect(data.length).toBe(2)
    expect(data[0]).toHaveProperty('row')
    expect(data[0]).toHaveProperty('col')
    expect(total).toBe(3)
    expect(hasNext).toBe(true)
  })
})