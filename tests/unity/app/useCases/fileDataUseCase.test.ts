import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FileDataUseCase } from 'app/useCases/files/implementations/fileData'
import { FileErrors } from 'domain/enums/files/fileErrors'
import { DomainError } from 'domain/entities/domainError'

const mockFileRepo = {
  findById: vi.fn()
}
const mockValidRepo = {
  findPage: vi.fn()
}

describe('FileDataUseCase', () => {
  let useCase: FileDataUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new FileDataUseCase(mockFileRepo as any, mockValidRepo as any)
  })

  it('should throw error if uuid is missing', async () => {
    await expect(useCase.execute('', 1)).rejects.toThrowError(DomainError)
  })

  it('should throw error if page is <= 0', async () => {
    await expect(useCase.execute('uuid', 0)).rejects.toThrowError(DomainError)
  })

  it('should throw if file is not found', async () => {
    mockFileRepo.findById.mockResolvedValueOnce(null)
    await expect(useCase.execute('uuid', 1)).rejects.toThrowError(DomainError)
  })

  it('should return message if file is pending', async () => {
    mockFileRepo.findById.mockResolvedValueOnce({ status: 'pending' })
    const res = await useCase.execute('uuid', 1)
    expect(res).toEqual({ message: 'File is yet to be processed' })
  })

  it('should return data and next for done file with next page', async () => {
    mockFileRepo.findById.mockResolvedValueOnce({ status: 'done' })
    mockValidRepo.findPage.mockResolvedValueOnce({ data: ['row1'] })
    mockValidRepo.findPage.mockResolvedValueOnce({ data: ['row2'] })

    const res = await useCase.execute('uuid', 1)
    expect(res).toEqual({ data: ['row1'], next: true })
  })

  it('should throw if page not found', async () => {
    mockFileRepo.findById.mockResolvedValueOnce({ status: 'done' })
    mockValidRepo.findPage.mockResolvedValueOnce(null)
    await expect(useCase.execute('uuid', 1)).rejects.toThrowError(DomainError)
  })
})
