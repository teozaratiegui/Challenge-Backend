import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetFileStatusUseCase } from 'app/useCases/files/implementations/fileStatus'
import { DomainError } from 'domain/entities/domainError'

const mockFileRepo = {
  findById: vi.fn()
}
const mockErrorRepo = {
  findByUuidWithPagination: vi.fn()
}

describe('GetFileStatusUseCase', () => {
  let useCase: GetFileStatusUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new GetFileStatusUseCase(mockFileRepo as any, mockErrorRepo as any)
  })

  it('should throw if limit > 100', async () => {
    await expect(useCase.execute('uuid', 101, 0)).rejects.toThrowError(DomainError)
  })

  it('should throw if offset < 0', async () => {
    await expect(useCase.execute('uuid', 10, -1)).rejects.toThrowError(DomainError)
  })

  it('should throw if file not found', async () => {
    mockFileRepo.findById.mockResolvedValueOnce(null)
    await expect(useCase.execute('uuid', 10, 0)).rejects.toThrowError(DomainError)
  })

  it('should return status if not done', async () => {
    mockFileRepo.findById.mockResolvedValueOnce({ status: 'processing' })
    const res = await useCase.execute('uuid', 10, 0)
    expect(res).toEqual({ status: 'processing' })
  })

  it('should return errors, total and hasNext when found', async () => {
    mockFileRepo.findById.mockResolvedValueOnce({ status: 'done' })
    mockErrorRepo.findByUuidWithPagination.mockResolvedValueOnce({
      fileErrors: [{ row: 1, col: 2 }],
      total: 1,
      hasNext: false
    })

    const res = await useCase.execute('uuid', 10, 0)
    expect(res).toEqual({
      status: 'done',
      errors: [{ row: 1, col: 2 }],
      total: 1,
      hasNext: false,
      limit: 10,
      offset: 0
    })
  })

  it('should return message if no errors found', async () => {
    mockFileRepo.findById.mockResolvedValueOnce({ status: 'done' })
    mockErrorRepo.findByUuidWithPagination.mockResolvedValueOnce({ fileErrors: [], total: 0, hasNext: false })

    const res = await useCase.execute('uuid', 10, 0)
    expect(res).toEqual({
      status: 'done',
      message: 'No error records found for the given limit and offset range.'
    })
  })
})
