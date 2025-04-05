import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import mongoose from 'mongoose'
import ValidRecordRepository from 'infra/repositories/mongodb/fileDataRepository'

const repository = new ValidRecordRepository()

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

describe('ValidRecordRepository Integration', () => {
  it('should save and find a valid page', async () => {
    const uuid = 'uuid-valid-1'
    const page = 1
    const data = [{ name: 'Alice', age: 30, nums: [1, 2, 3] }]

    await repository.savePage(uuid, page, data)
    const result = await repository.findPage(uuid, page)

    expect(result?.data.map(d => d.toObject())).toEqual(data)
  })

  it('should bulk insert valid pages', async () => {
    const pages = [
      { uuid: 'uuid-valid-bulk', page: 1, data: [{ name: 'Bob', age: 28, nums: [4, 5] }] },
      { uuid: 'uuid-valid-bulk', page: 2, data: [{ name: 'Carol', age: 25, nums: [6] }] },
    ]

    await repository.bulkInsertPages(pages)
    const page1 = await repository.findPage('uuid-valid-bulk', 1)
    const page2 = await repository.findPage('uuid-valid-bulk', 2)

    
    expect(page1?.data.map(d => d.toObject())).toEqual(pages[0].data)

    expect(page2?.data.map(d => d.toObject())).toEqual(pages[1].data)
  })
})