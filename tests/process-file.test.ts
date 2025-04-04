// test/processFileUseCase.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProcessFileUseCase } from 'app/useCases/files/implementations/processFile'
import { QueueFileUseCase } from 'app/useCases/files/implementations/queueFile'
import { GetFileStatusUseCase } from 'app/useCases/files/implementations/fileStatus'
import { FileDataUseCase } from 'app/useCases/files/implementations/fileData'
import ExcelJS from 'exceljs'
import fs from 'fs/promises'
import path from 'path'
import { logger } from 'infra/logger/logger'

const mockFileRepo = {
  updateStatus: vi.fn(),
  create: vi.fn(),
  findById: vi.fn()
}
const mockValidRepo = {
  bulkInsertPages: vi.fn(),
  findPage: vi.fn(),
  savePage: vi.fn()
}
const mockErrorRepo = {
  bulkInsertPages: vi.fn(),
  findPage: vi.fn(),
  savePage: vi.fn()
}
const mockPublisher = {
  send: vi.fn()
}

describe('ProcessFileUseCase', () => {
  let useCase: ProcessFileUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new ProcessFileUseCase(
      mockFileRepo,
      mockValidRepo,
      mockErrorRepo
    )
  })

  const createWorkbookWithRows = async (rows: any[][]) => {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Sheet1')
    sheet.addRow(['name', 'age', 'nums'])
    rows.forEach(r => sheet.addRow(r))

    const filePath = path.join(__dirname, 'testfile.xlsx')
    await workbook.xlsx.writeFile(filePath)
    return filePath
  }

  it('should process valid rows correctly', async () => {
    const file = await createWorkbookWithRows([
      ['John', 25, '1,2,3']
    ])

    await useCase.execute('uuid-1', file)

    expect(mockValidRepo.bulkInsertPages).toHaveBeenCalled()
    expect(mockErrorRepo.bulkInsertPages).not.toHaveBeenCalled()
  })

  it('should detect all error cases in one row', async () => {
    const file = await createWorkbookWithRows([
      [123, 'invalid', 'notnums', 'extra']
    ])

    await useCase.execute('uuid-errors', file)
    expect(mockErrorRepo.bulkInsertPages).toHaveBeenCalled()
  })

  it('should delete the file after processing', async () => {
    const file = await createWorkbookWithRows([
      ['DeleteMe', 42, '1,2,3']
    ])

    const unlinkSpy = vi.spyOn(fs, 'unlink').mockResolvedValueOnce(undefined)
    await useCase.execute('uuid-delete-test', file)
    expect(unlinkSpy).toHaveBeenCalledWith(file)
  })

  it('should store uuid and page correctly with valid data', async () => {
    const file = await createWorkbookWithRows([
      ['Alice', 30, '3,2,1'],
      ['Bob', 28, '9,5,1']
    ])

    await useCase.execute('uuid-xyz', file)

    expect(mockValidRepo.bulkInsertPages).toHaveBeenCalled()
  })

  it('should not save valid rows when all are invalid', async () => {
    const file = await createWorkbookWithRows([
      [null, null, null],
      [undefined, 'str', '1,a']
    ])

    await useCase.execute('uuid-no-valid', file)
    expect(mockValidRepo.bulkInsertPages).not.toHaveBeenCalled()
    expect(mockErrorRepo.bulkInsertPages).toHaveBeenCalled()
  })
})

describe('QueueFileUseCase', () => {
  it('should create file and send message with UUID and path', async () => {
    const uuid = 'test-uuid'
    mockFileRepo.create.mockResolvedValue({ uuid })

    const useCase = new QueueFileUseCase(mockFileRepo, mockPublisher)
    const path = 'path/to/file.xlsx'

    const result = await useCase.execute(path)

    expect(mockFileRepo.create).toHaveBeenCalledWith({ filePath: path, status: 'pending' })
    expect(mockPublisher.send).toHaveBeenCalledWith('xlsx.upload', { uuid, path })
    expect(result).toBe(uuid)
  })
})

describe('GetFileStatusUseCase', () => {
  const useCase = new GetFileStatusUseCase(mockFileRepo, mockErrorRepo)

  it('should return status only when file is not done', async () => {
    mockFileRepo.findById.mockResolvedValue({ status: 'processing' })
    const res = await useCase.execute('uuid', 1)
    expect(res).toEqual({ status: 'processing' })
  })

  it('should return error page and next when file is done', async () => {
    mockFileRepo.findById.mockResolvedValue({ status: 'done' })
    mockErrorRepo.findPage.mockResolvedValueOnce({ fileErrors: ['err'] })
    mockErrorRepo.findPage.mockResolvedValueOnce(null)
    const res = await useCase.execute('uuid', 1)
    expect(res).toEqual({ status: 'done', errors: ['err'], next: false })
  })
})

describe('FileDataUseCase', () => {
  const useCase = new FileDataUseCase(mockFileRepo, mockValidRepo)

  it('should return file data and next if file is done', async () => {
    mockFileRepo.findById.mockResolvedValue({ status: 'done' })
    mockValidRepo.findPage.mockResolvedValueOnce({ data: ['d1'] })
    mockValidRepo.findPage.mockResolvedValueOnce(null)
    const res = await useCase.execute('uuid', 1)
    expect(res).toEqual({ data: ['d1'], next: false })
  })

  it('should return message if file is pending', async () => {
    mockFileRepo.findById.mockResolvedValue({ status: 'pending' })
    const res = await useCase.execute('uuid', 1)
    expect(res).toEqual({ message: 'File is yet to be processed' })
  })
})
