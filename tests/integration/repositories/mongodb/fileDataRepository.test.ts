import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import mongoose from 'mongoose'
import { FileDataRepository } from 'infra/repositories/mongodb/fileDataRepository'

const validRepo = new FileDataRepository()
const MONGO_URI = process.env.MONGO_TEST_URI || 'mongodb://mongo:27017/test' 

beforeAll(async () => {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as any)
})

beforeEach(async () => {
  await validRepo.deleteMany()
})

afterAll(async () => {
  await mongoose.disconnect()
})

describe('ValidRecordRepository Integration', () => {
  it('should bulk insert and paginate valid records', async () => {
    const uuid = 'uuid-valid-bulk'
    const records = [
      { uuid, name: 'Alice', age: 30, nums: [1, 2, 3] },
      { uuid, name: 'Bob', age: 25, nums: [4, 5, 6] },
      { uuid, name: 'Charlie', age: 40, nums: [7, 8, 9] },
    ]

    await validRepo.bulkInsert(records)

    const { data, total, hasNext } = await validRepo.findByUuidWithPagination(uuid, 2, 0)

    expect(data.length).toBe(2)
    expect(data[0]).toHaveProperty('name')
    expect(data[0]).toHaveProperty('age')
    expect(data[0]).toHaveProperty('nums')
    expect(total).toBe(3)
    expect(hasNext).toBe(true)
  })
})