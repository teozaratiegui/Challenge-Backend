import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FileDataUseCase } from 'app/useCases/files/implementations/fileData'
import { DomainError } from 'domain/entities/domainError'

const mockFileRepo = {
  findById: vi.fn()
}
const mockValidRepo = {
  findByUuidWithPagination: vi.fn()
}

describe('FileDataUseCase', () => {
  let useCase: FileDataUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new FileDataUseCase(mockFileRepo as any, mockValidRepo as any)
  })

  it('should throw error if uuid is missing', async () => {
    await expect(useCase.execute('', 10, 0)).rejects.toThrowError(DomainError)
  })

  it('should throw error if limit > 100', async () => {
    await expect(useCase.execute('uuid', 101, 0)).rejects.toThrowError(DomainError)
  })

  it('should throw error if file not found', async () => {
    mockFileRepo.findById.mockResolvedValueOnce(null)
    await expect(useCase.execute('uuid', 10, 0)).rejects.toThrowError(DomainError)
  })

  it('should return message if file is pending', async () => {
    mockFileRepo.findById.mockResolvedValueOnce({ status: 'pending' })
    const res = await useCase.execute('uuid', 10, 0)
    expect(res).toEqual({ message: 'File is yet to be processed' })
  })

  it('should return data, total and hasNext if records exist', async () => {
    const mockLimit = 10
    const mockOffset = 0
  
    mockFileRepo.findById.mockResolvedValueOnce({ status: 'done' })
    mockValidRepo.findByUuidWithPagination.mockResolvedValueOnce({
      data: [{ name: 'Test', age: 30, nums: [1, 2, 3] }],
      total: 1,
      hasNext: false,
      limit: mockLimit,
      offset: mockOffset
    })
  
    const res = await useCase.execute('uuid', mockLimit, mockOffset)
    expect(res).toEqual({
      data: [{ name: 'Test', age: 30, nums: [1, 2, 3] }],
      total: 1,
      hasNext: false,
      limit: mockLimit,
      offset: mockOffset
    })
  })
  

  it('should return message if no records found', async () => {
    mockFileRepo.findById.mockResolvedValueOnce({ status: 'done' })
    mockValidRepo.findByUuidWithPagination.mockResolvedValueOnce({
      data: [],
      total: 0,
      hasNext: false
    })

    const res = await useCase.execute('uuid', 10, 0)
    expect(res).toEqual({ message: 'No records found for the given limit and offset range.' })
  })
})