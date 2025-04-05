import ErrorRecordRepository from 'infra/repositories/mongodb/fileErrorsRepository'
import mongoose from 'mongoose'

const errorRepo = new ErrorRecordRepository()

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

describe('ErrorRecordRepository Integration', () => {
  it('should save and find error pages', async () => {
    const uuid = 'uuid-error-1'
    const page = 1
    const errors = [{ row: 2, col: 1 }, { row: 2, col: 2 }]

    await errorRepo.savePage(uuid, page, errors)
    const result = await errorRepo.findPage(uuid, page)

    expect(result?.fileErrors).toEqual(errors)
  })

  it('should bulk insert error pages', async () => {
    const errorPages = [
      { uuid: 'uuid-error-bulk', page: 1, fileErrors: [{ row: 3, col: 1 }] },
      { uuid: 'uuid-error-bulk', page: 2, fileErrors: [{ row: 4, col: 2 }] },
    ]

    await errorRepo.bulkInsertPages(errorPages)
    const page1 = await errorRepo.findPage('uuid-error-bulk', 1)
    const page2 = await errorRepo.findPage('uuid-error-bulk', 2)

    expect(page1?.fileErrors).toMatchObject(errorPages[0].fileErrors)
    expect(page2?.fileErrors).toMatchObject(errorPages[1].fileErrors)
  })
})
