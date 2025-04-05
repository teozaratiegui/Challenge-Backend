// processFileUseCase.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProcessFileUseCase } from 'app/useCases/files/implementations/processFile'
import ExcelJS from 'exceljs'
import path from 'path'
import fs from 'fs/promises'

const mockFileRepo = {
  updateStatus: vi.fn(),
  create: vi.fn(),
  findById: vi.fn()
}

const mockValidRepo = {
  bulkInsert: vi.fn(),
  findByUuidWithPagination: vi.fn()
}

const mockErrorRepo = {
  bulkInsert: vi.fn(),
  findByUuidWithPagination: vi.fn()
}

let useCase: ProcessFileUseCase

const createWorkbookWithRows = async (rows: any[][]) => {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Sheet1')
  sheet.addRow(['name', 'age', 'nums'])
  rows.forEach(r => sheet.addRow(r))

  const filePath = path.join(__dirname, 'testfile.xlsx')
  await workbook.xlsx.writeFile(filePath)
  return filePath
}

describe('ProcessFileUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new ProcessFileUseCase(
      mockFileRepo as any,
      mockValidRepo as any,
      mockErrorRepo as any
    )
  })

  it('should process valid rows correctly', async () => {
    const file = await createWorkbookWithRows([
      ['John', 25, '1,2,3']
    ])

    await useCase.execute('uuid-1', file)

    expect(mockValidRepo.bulkInsert).toHaveBeenCalled()
    expect(mockErrorRepo.bulkInsert).not.toHaveBeenCalled()
  })

  it('should detect all error cases in one row', async () => {
    const file = await createWorkbookWithRows([
      [123, 'invalid', 'notnums', 'extra']
    ])

    await useCase.execute('uuid-errors', file)
    expect(mockErrorRepo.bulkInsert).toHaveBeenCalled()
  })

  it('should delete the file after processing', async () => {
    const file = await createWorkbookWithRows([
      ['DeleteMe', 42, '1,2,3']
    ])

    const unlinkSpy = vi.spyOn(fs, 'unlink').mockResolvedValueOnce(undefined)
    await useCase.execute('uuid-delete-test', file)
    expect(unlinkSpy).toHaveBeenCalledWith(file)
  })

  it('should store uuid correctly with valid data', async () => {
    const file = await createWorkbookWithRows([
      ['Alice', 30, '3,2,1'],
      ['Bob', 28, '9,5,1']
    ])

    await useCase.execute('uuid-xyz', file)

    expect(mockValidRepo.bulkInsert).toHaveBeenCalled()
  })

  it('should not save valid rows when all are invalid', async () => {
    const file = await createWorkbookWithRows([
      [null, null, null],
      [undefined, 'str', '1,a']
    ])

    await useCase.execute('uuid-no-valid', file)
    expect(mockValidRepo.bulkInsert).not.toHaveBeenCalled()
    expect(mockErrorRepo.bulkInsert).toHaveBeenCalled()
  })
})
